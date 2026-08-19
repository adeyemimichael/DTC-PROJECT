-- =========================================================
-- DUROM'S TOUCH CLINIC (DTC) — Full Database Setup
-- Target: Supabase (Postgres 15+)
-- Run once, top to bottom, in the Supabase SQL editor.
-- =========================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- Generic updated_at maintainer, reused across tables
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- =========================================================
-- PROFILES
-- One row per authenticated user (patient or admin). Created
-- automatically via trigger the moment someone signs up.
-- =========================================================
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  role        text not null default 'patient' check (role in ('patient', 'admin')),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name',
          coalesce(new.raw_user_meta_data->>'role', 'patient'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

drop trigger if exists trg_profiles_updated_at on profiles;
create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute procedure set_updated_at();

-- Helper used by every RLS policy below: is the caller the admin?
create or replace function public.is_admin()
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

grant execute on function public.is_admin() to authenticated;

-- Nobody can self-promote to admin via a normal update — only a
-- service-role request (your backend, never the browser) may.
create or replace function prevent_role_change()
returns trigger language plpgsql as $$
begin
  if new.role <> old.role and coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'role can only be changed by the server';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_change on profiles;
create trigger trg_prevent_role_change
  before update on profiles
  for each row execute procedure prevent_role_change();

alter table profiles enable row level security;

create policy "profiles_select_own_or_admin"
  on profiles for select
  using (id = auth.uid() or is_admin());

create policy "profiles_update_own_or_admin"
  on profiles for update
  using (id = auth.uid() or is_admin())
  with check (id = auth.uid() or is_admin());
-- No insert policy: rows are created only by handle_new_user().


-- =========================================================
-- PATIENTS
-- Clinical/registration record, 1:1 with profiles. `status`
-- starts pending_payment and only becomes active once the
-- Paystack webhook confirms payment.
-- =========================================================
create table if not exists patients (
  id                 uuid primary key references profiles(id) on delete cascade,
  date_of_birth      date,
  gender             text check (gender in ('male', 'female', 'other')),
  address            text,
  next_of_kin_name   text,
  next_of_kin_phone  text,
  passport_url       text,  -- the patient's single profile/ID photo
  status             text not null default 'pending_payment'
                       check (status in ('pending_payment', 'active', 'inactive')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

drop trigger if exists trg_patients_updated_at on patients;
create trigger trg_patients_updated_at
  before update on patients
  for each row execute procedure set_updated_at();

-- `status` can only change via a service-role request (i.e. the
-- Paystack webhook handler), never a direct client update.
create or replace function prevent_status_change()
returns trigger language plpgsql as $$
begin
  if new.status <> old.status and coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'status can only be changed by the server';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_patient_status_change on patients;
create trigger trg_prevent_patient_status_change
  before update on patients
  for each row execute procedure prevent_status_change();

alter table patients enable row level security;

create policy "patients_select_own_or_admin"
  on patients for select
  using (id = auth.uid() or is_admin());

create policy "patients_insert_own"
  on patients for insert
  with check (id = auth.uid());

create policy "patients_update_own_or_admin"
  on patients for update
  using (id = auth.uid() or is_admin())
  with check (id = auth.uid() or is_admin());
-- `status` itself is still protected separately by the trigger above.


-- =========================================================
-- VITALS
-- Append-only log, entered by the patient. Everything else on
-- a patient's page is read-only to them — this is the exception.
-- =========================================================
create table if not exists vitals (
  id                        uuid primary key default gen_random_uuid(),
  patient_id                uuid not null references patients(id) on delete cascade,
  recorded_at               timestamptz not null default now(),
  blood_pressure_systolic   int,
  blood_pressure_diastolic  int,
  heart_rate_bpm            int,
  temperature_c             numeric(4,1),
  weight_kg                 numeric(5,1),
  height_cm                 numeric(5,1),
  spo2_percent              int,
  blood_sugar_mmol          numeric(5,1),
  notes                     text,
  created_at                timestamptz not null default now()
);

create index if not exists idx_vitals_patient on vitals(patient_id, recorded_at desc);

alter table vitals enable row level security;

create policy "vitals_select_own_or_admin"
  on vitals for select
  using (patient_id = auth.uid() or is_admin());

create policy "vitals_insert_own_or_admin"
  on vitals for insert
  with check (patient_id = auth.uid() or is_admin());
-- No update/delete for anyone: vitals are an immutable log.


-- =========================================================
-- SERVICES
-- Admin-managed catalog (General Consultation, Special Care,
-- Telemedicine, etc). Appointments reference a service rather
-- than a hardcoded type, so pricing/duration live in one place.
-- =========================================================
create table if not exists services (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  description       text,
  duration_minutes  int not null,
  price             numeric(10,2) not null,
  currency          text not null default 'NGN',
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

drop trigger if exists trg_services_updated_at on services;
create trigger trg_services_updated_at
  before update on services
  for each row execute procedure set_updated_at();

alter table services enable row level security;

create policy "services_select_active_or_admin"
  on services for select
  using (is_active = true or is_admin());

create policy "services_insert_admin_only"
  on services for insert
  with check (is_admin());

create policy "services_update_admin_only"
  on services for update
  using (is_admin())
  with check (is_admin());

create policy "services_delete_admin_only"
  on services for delete
  using (is_admin());


-- =========================================================
-- PATIENT UPLOADS
-- Patient-only, both ways: whatever the patient uploads
-- themselves (a scanned lab result, a symptom photo/audio/video).
-- Nothing here points at an appointment — appointments point at
-- this table instead (see appointments.patient_upload_id).
-- =========================================================
create table if not exists patient_uploads (
  id            uuid primary key default gen_random_uuid(),
  patient_id    uuid not null references patients(id) on delete cascade,
  file_type     text not null check (file_type in ('image', 'audio', 'video', 'document')),
  category      text not null default 'general' check (category in ('lab_result_scan', 'general')),
  storage_path  text not null,
  description   text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_patient_uploads_patient on patient_uploads(patient_id, created_at desc);

alter table patient_uploads enable row level security;

create policy "patient_uploads_select_own_or_admin"
  on patient_uploads for select
  using (patient_id = auth.uid() or is_admin());

create policy "patient_uploads_insert_own"
  on patient_uploads for insert
  with check (patient_id = auth.uid());
-- No update/delete, no admin insert: this table is exclusively
-- for what the patient themselves uploads, as a permanent record.


-- =========================================================
-- MEDICAL DOCUMENTS
-- Doctor-only. Covers everything the admin issues or writes for
-- a patient: lab orders, prescriptions, referrals, and clinical
-- notes (a note is just a document — typed as text, and can also
-- be turned into a PDF like the others). Category-specific
-- fields live in `details`.
--
--   lab_order     -> details: { test_name, instructions }
--   prescription  -> details: { medications: [...] }
--   referral      -> details: { referred_to, reason }
--   clinical_note -> details: { content }
-- =========================================================
create table if not exists medical_documents (
  id                uuid primary key default gen_random_uuid(),
  patient_id        uuid not null references patients(id) on delete cascade,
  clinician_id      uuid not null references profiles(id),
  category          text not null
                       check (category in ('lab_order', 'prescription', 'referral', 'clinical_note')),
  title             text,
  details           jsonb not null default '{}'::jsonb,
  pdf_storage_path  text,
  status            text check (status is null or status in ('ordered', 'result_uploaded', 'completed')),
  created_at        timestamptz not null default now()
);

create index if not exists idx_medical_documents_patient on medical_documents(patient_id, created_at desc);
create index if not exists idx_medical_documents_category on medical_documents(patient_id, category);

alter table medical_documents enable row level security;

create policy "medical_documents_select_own_or_admin"
  on medical_documents for select
  using (patient_id = auth.uid() or is_admin());

create policy "medical_documents_insert_admin_only"
  on medical_documents for insert
  with check (is_admin());

create policy "medical_documents_update_admin_only"
  on medical_documents for update
  using (is_admin())
  with check (is_admin());


-- =========================================================
-- APPOINTMENTS
-- patient_upload_id = what the patient attached at booking.
-- completion_note = doctor's quick text at completion (mirrors
-- `reason` on the patient's side). completion_note_id optionally
-- links to a fuller medical_documents (clinical_note) record.
-- =========================================================
create table if not exists appointments (
  id                   uuid primary key default gen_random_uuid(),
  patient_id           uuid not null references patients(id) on delete cascade,
  clinician_id         uuid references profiles(id),
  service_id           uuid not null references services(id),
  scheduled_at         timestamptz not null,
  status               text not null default 'pending_payment'
                          check (status in
                            ('pending_payment', 'pending_approval', 'confirmed',
                             'declined', 'completed', 'cancelled', 'missed')),
  booked_by            text not null default 'patient' check (booked_by in ('patient', 'admin')),
  reason               text,
  patient_upload_id    uuid references patient_uploads(id),
  completion_note      text,
  completion_note_id   uuid references medical_documents(id),
  meeting_link         text,
  cancelled_by         text check (cancelled_by in ('patient', 'admin')),
  cancellation_reason  text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists idx_appointments_patient on appointments(patient_id, scheduled_at desc);
create index if not exists idx_appointments_service on appointments(service_id);
create index if not exists idx_appointments_upcoming on appointments(scheduled_at) where status = 'confirmed';

drop trigger if exists trg_appointments_updated_at on appointments;
create trigger trg_appointments_updated_at
  before update on appointments
  for each row execute procedure set_updated_at();

alter table appointments enable row level security;

create policy "appointments_select_own_or_admin"
  on appointments for select
  using (patient_id = auth.uid() or is_admin());

-- Patients may only attach an upload that's actually theirs.
create policy "appointments_insert_patient_or_admin"
  on appointments for insert
  with check (
    (
      patient_id = auth.uid()
      and booked_by = 'patient'
      and (
        patient_upload_id is null
        or exists (select 1 from patient_uploads pu
                   where pu.id = patient_upload_id and pu.patient_id = auth.uid())
      )
    )
    or is_admin()
  );

-- State changes (approve/decline/complete/cancel) are admin-only.
-- Patient-initiated cancel/reschedule go through dedicated API
-- routes that enforce business rules server-side, not a raw
-- client UPDATE.
create policy "appointments_update_admin_only"
  on appointments for update
  using (is_admin())
  with check (
    is_admin()
    and (
      completion_note_id is null
      or exists (select 1 from medical_documents md
                 where md.id = completion_note_id and md.patient_id = patient_id)
    )
  );


-- =========================================================
-- PAYMENTS
-- One row per Paystack transaction. No client update policy at
-- all — only the service-role webhook handler may transition
-- `status` (it bypasses RLS entirely).
-- =========================================================
create table if not exists payments (
  id                      uuid primary key default gen_random_uuid(),
  patient_id              uuid not null references patients(id) on delete cascade,
  purpose                 text not null
                             check (purpose in ('registration', 'appointment', 'follow_up', 'other')),
  related_appointment_id  uuid references appointments(id),
  amount                  numeric(10,2) not null,
  currency                text not null default 'NGN',
  paystack_reference      text unique not null,
  paystack_access_code    text,
  status                  text not null default 'pending'
                             check (status in ('pending', 'success', 'failed', 'abandoned')),
  paid_at                 timestamptz,
  created_at              timestamptz not null default now()
);

create index if not exists idx_payments_patient on payments(patient_id, created_at desc);
create index if not exists idx_payments_reference on payments(paystack_reference);

alter table payments enable row level security;

create policy "payments_select_own_or_admin"
  on payments for select
  using (patient_id = auth.uid() or is_admin());

create policy "payments_insert_own"
  on payments for insert
  with check (patient_id = auth.uid() and status = 'pending');


-- =========================================================
-- NOTIFICATIONS
-- Rows are created server-side / by triggers only. Users may
-- only read their own and mark their own as read.
-- =========================================================
create table if not exists notifications (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id) on delete cascade,
  type           text not null
                    check (type in
                      ('appointment_upcoming', 'appointment_booked', 'new_upload',
                       'payment_success', 'new_document')),
  title          text not null,
  message        text,
  related_table  text,
  related_id     uuid,
  is_read        boolean not null default false,
  created_at     timestamptz not null default now()
);

create index if not exists idx_notifications_user on notifications(user_id, is_read, created_at desc);

alter table notifications enable row level security;

create policy "notifications_select_own"
  on notifications for select
  using (user_id = auth.uid());

create policy "notifications_update_own_mark_read"
  on notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- =========================================================
-- STORAGE BUCKETS
-- Every upload MUST use a path starting with "{owner_id}/..." —
-- these policies check the first folder segment of the path
-- against auth.uid(), so an upload to the wrong path is simply
-- rejected. RLS is already enabled on storage.objects by
-- default in Supabase — do NOT try to enable it yourself here,
-- that table is owned by supabase_storage_admin, not you.
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('passports', 'passports', false, 5242880,
    array['image/jpeg', 'image/png', 'application/pdf']),
  ('patient-uploads', 'patient-uploads', false, 52428800,
    array['image/jpeg', 'image/png', 'audio/mpeg', 'audio/mp4', 'audio/wav',
          'video/mp4', 'video/quicktime', 'application/pdf']),
  ('medical-documents', 'medical-documents', false, 10485760,
    array['application/pdf']),
  ('avatars', 'avatars', true, 2097152,
    array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- passports: patient's single profile/ID photo. Path: passports/{patient_id}/...
create policy "passports_select_own_or_admin"
  on storage.objects for select
  using (bucket_id = 'passports' and (auth.uid()::text = (storage.foldername(name))[1] or is_admin()));

create policy "passports_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'passports' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "passports_update_own"
  on storage.objects for update
  using (bucket_id = 'passports' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "passports_delete_own_or_admin"
  on storage.objects for delete
  using (bucket_id = 'passports' and (auth.uid()::text = (storage.foldername(name))[1] or is_admin()));

-- patient-uploads: matches the patient_uploads table. Path: patient-uploads/{patient_id}/...
create policy "patient_uploads_bucket_select_own_or_admin"
  on storage.objects for select
  using (bucket_id = 'patient-uploads' and (auth.uid()::text = (storage.foldername(name))[1] or is_admin()));

create policy "patient_uploads_bucket_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'patient-uploads' and auth.uid()::text = (storage.foldername(name))[1]);
-- No update/delete: matches patient_uploads being an immutable log.

-- medical-documents: admin-issued PDFs only. Path: medical-documents/{patient_id}/...
create policy "medical_documents_bucket_select_own_or_admin"
  on storage.objects for select
  using (bucket_id = 'medical-documents' and (auth.uid()::text = (storage.foldername(name))[1] or is_admin()));

create policy "medical_documents_bucket_insert_admin_only"
  on storage.objects for insert
  with check (bucket_id = 'medical-documents' and is_admin());

create policy "medical_documents_bucket_update_admin_only"
  on storage.objects for update
  using (bucket_id = 'medical-documents' and is_admin());

create policy "medical_documents_bucket_delete_admin_only"
  on storage.objects for delete
  using (bucket_id = 'medical-documents' and is_admin());

-- avatars: public bucket, admin's "Meet Dr. Stephen" photo only. Path: avatars/{profile_id}/...
create policy "avatars_select_all"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatars_update_own"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatars_delete_own"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);