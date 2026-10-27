'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  MessageCircle,
  FileArchive,
  Heart,
  BarChart3,
  TrendingUp,
  FileText,
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Printer,
} from 'lucide-react';
import { PatientData, MedicalRecordItem } from '@/data/patientsData';
import {
  formatPatientSince,
  formatPatientStatus,
  getAgeFromDob,
  getPrimaryImage,
  usePatients,
} from '@/src/hooks/usePatients';
import {
  useMedicalDocuments,
  type MedicalDocumentCategory,
  type MedicalDocumentStatus,
} from '@/hooks';

export default function PatientDetailsPage() {
  const params = useParams();
  const patientId = (params?.id as string) || '1';
  const {
    patients,
    fetchPatients,
    fetchPatientVitals,
    fetchPatientMedicalRecords,
    fetchPatientUploads,
    vitals,
    medicalRecords,
    patientUploads,
    isLoadingPatients,
    isLoadingMedicalRecords,
    isLoadingPatientUploads,
    patientsError,
  } = usePatients();

  useEffect(() => {
    void fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    if (patientId) {
      void fetchPatientVitals(patientId);
      void fetchPatientMedicalRecords(patientId);
      void fetchPatientUploads(patientId);
    }
  }, [fetchPatientMedicalRecords, fetchPatientUploads, fetchPatientVitals, patientId]);

  // The live patient record from the roster fetch. Used by the `patient` view
  // model below and by the loading/not-found guards. No mock fallback.
  const livePatientRecord = patients.find((record) => record.id === patientId) ?? null;


  const patient: PatientData = useMemo(() => {
    if (!livePatientRecord) {
      return {
        id: patientId,
        name: '—',
        avatar: '',
        gender: '—',
        bloodType: '—',
        since: '—',
        contact: '—',
        address: '—',
        condition: '—',
      };
    }

    const computedAge = livePatientRecord.date_of_birth ? getAgeFromDob(livePatientRecord.date_of_birth) : null;
    const avatarSource = getPrimaryImage(livePatientRecord, '');

    return {
      id: livePatientRecord.id,
      name: livePatientRecord.full_name ?? '—',
      avatar: avatarSource,
      gender: livePatientRecord.gender ?? '—',
      age: computedAge ?? undefined,
      bloodType: livePatientRecord.blood_group ?? '—',
      contact: livePatientRecord.phone ?? '—',
      address: livePatientRecord.address ?? '—',
      since: formatPatientSince(livePatientRecord.created_at),
      condition: formatPatientStatus(livePatientRecord.status),
    };
  }, [livePatientRecord, patientId]);

  const latestVital = vitals[0] ?? null;

  const displayedVitals = useMemo(() => {
    if (!latestVital) {
      return {
        bp: '--',
        hr: '--',
        weight: '--',
        tsh: 'Not set',
        biomarkerName: 'Blood Sugar',
      };
    }

    return {
      bp: `${latestVital.blood_pressure_systolic}/${latestVital.blood_pressure_diastolic}`,
      hr: `${latestVital.heart_rate_bpm}`,
      weight: `${latestVital.weight_kg} kg`,
      tsh: latestVital.blood_sugar_mmol ? `${latestVital.blood_sugar_mmol.toFixed(1)} mmol/L` : 'Not set',
      biomarkerName: 'Blood Sugar',
    };
  }, [latestVital]);

  const displayedVitalHistory = useMemo(() => {
    if (vitals.length === 0) {
      return [];
    }

    return vitals.map((vital) => ({
      date: new Date(vital.recorded_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      weight: `${vital.weight_kg} kg`,
      temp: `${vital.temperature_c ?? '--'} °C`,
      hr: `${vital.heart_rate_bpm ?? '--'} bpm`,
      bp: vital.blood_pressure_systolic && vital.blood_pressure_diastolic
        ? `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic}`
        : '--',
      fbs: vital.blood_sugar_mmol ? `${vital.blood_sugar_mmol.toFixed(1)} mmol/L` : '--',
    }));
  }, [vitals]);

  /** Convert a details jsonb object */
  const formatDetails = (
    category: string,
    details: Record<string, unknown>,
  ): string => {
    if (!details || typeof details !== 'object') return 'No additional details provided.';
    switch (category) {
      case 'lab_order': {
        const parts: string[] = [];
        if (details.test_name) parts.push(`Test: ${details.test_name}`);
        if (details.instructions) parts.push(`Instructions: ${details.instructions}`);
        return parts.join(' · ') || 'Lab order';
      }
      case 'prescription': {
        const meds = Array.isArray(details.medications)
          ? (details.medications as string[]).join(', ')
          : String(details.medications ?? '');
        return meds ? `Medications: ${meds}` : 'Prescription';
      }
      case 'referral': {
        const parts: string[] = [];
        if (details.referred_to) parts.push(`Referred to: ${details.referred_to}`);
        if (details.reason) parts.push(`Reason: ${details.reason}`);
        return parts.join(' · ') || 'Referral';
      }
      case 'clinical_note': {
        return String(details.content ?? 'Clinical note');
      }
      default:
        return Object.values(details).join(' · ') || 'No additional details provided.';
    }
  };

  const displayedMedicalRecords = useMemo(() => {
    const adminRecords = medicalRecords.map((record) => {
      const recordType: MedicalRecordItem['type'] =
        record.category === 'lab_order'      ? 'Lab Order'    :
        record.category === 'prescription'   ? 'Prescription' :
        record.category === 'referral'       ? 'Referral'     :
        record.category === 'clinical_note'  ? 'Clinical Note':
                                               'Clinical Note';

      const details = typeof record.details === 'string'
        ? record.details
        : record.details && typeof record.details === 'object'
          ? formatDetails(record.category ?? '', record.details as Record<string, unknown>)
          : 'No additional details provided.';

      return {
        id: record.id,
        title: record.title || 'Medical document',
        type: recordType,
        date: record.created_at
          ? new Date(record.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
          : 'Unknown date',
        details,
        author: record.clinician?.full_name || 'Clinical team',
        fileUrl: record.signedUrl || undefined,
      } satisfies MedicalRecordItem;
    });

    const patientUploadRecords = patientUploads.map((upload) => ({
      id: upload.id,
      title: upload.description || 'Uploaded document',
      type: 'Patient Upload' as MedicalRecordItem['type'],
      date: upload.created_at
        ? new Date(upload.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
        : 'Unknown date',
      details: upload.description || 'Uploaded by patient',
      author: 'Patient upload',
      fileUrl: upload.signedUrl || undefined,
    } satisfies MedicalRecordItem));

    return [...adminRecords, ...patientUploadRecords];
  }, [medicalRecords, patientUploads]);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Modals state
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecordItem | null>(null);

  // Upload hook
  const { uploadDocument, isUploading: isUploadingDoc } = useMedicalDocuments();

  // Upload form state 
  const EMPTY_NOTE = {
    title: '',
    category: 'lab_order' as MedicalDocumentCategory,
    // lab_order fields
    test_name: '',
    instructions: '',
    lab_status: 'ordered' as MedicalDocumentStatus,
    // prescription fields
    medications: '',
    // referral fields
    referred_to: '',
    referral_reason: '',
    // clinical_note fields
    content: '',
    // file
    file: null as File | null,
  };

  const [noteForm, setNoteForm] = useState(EMPTY_NOTE);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!noteForm.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }
    if (!noteForm.file) {
      showToast('Please attach a PDF file', 'error');
      return;
    }

    // Build per-category details object
    let details: Record<string, unknown> = {};
    if (noteForm.category === 'lab_order') {
      if (!noteForm.test_name.trim()) {
        showToast('Test name is required for a lab order', 'error');
        return;
      }
      details = { test_name: noteForm.test_name.trim(), instructions: noteForm.instructions.trim() };
    } else if (noteForm.category === 'prescription') {
      if (!noteForm.medications.trim()) {
        showToast('Medications are required for a prescription', 'error');
        return;
      }
      details = {
        medications: noteForm.medications
          .split('\n')
          .map((m) => m.trim())
          .filter(Boolean),
      };
    } else if (noteForm.category === 'referral') {
      if (!noteForm.referred_to.trim() || !noteForm.referral_reason.trim()) {
        showToast('Referred to and reason are required for a referral', 'error');
        return;
      }
      details = { referred_to: noteForm.referred_to.trim(), reason: noteForm.referral_reason.trim() };
    } else if (noteForm.category === 'clinical_note') {
      if (!noteForm.content.trim()) {
        showToast('Content is required for a clinical note', 'error');
        return;
      }
      details = { content: noteForm.content.trim() };
    }

    const res = await uploadDocument({
      file: noteForm.file,
      patient_id: patientId,
      title: noteForm.title.trim(),
      category: noteForm.category,
      details: details as Parameters<typeof uploadDocument>[0]['details'],
      status: noteForm.category === 'lab_order' ? noteForm.lab_status : undefined,
    });

    if (res.success) {
      showToast(`Medical record added to ${patient.name}'s file successfully!`);
      setIsAddNoteOpen(false);
      setNoteForm(EMPTY_NOTE);
      // Refresh both records lists
      void fetchPatientMedicalRecords(patientId);
    } else {
      showToast(res.error || 'Upload failed. Please try again.', 'error');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    showToast(`Message sent to ${patient.name}!`);
    setIsMessageOpen(false);
    setMessageText('');
  };

  const [messageText, setMessageText] = useState('');

  const handlePrintRecord = () => {
    showToast('Printing medical document...');
  };

  const getPreviewForRecord = (fileUrl?: string, title?: string) => {
    if (!fileUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 text-sm font-normal">
          Preview unavailable
        </div>
      );
    }

    const lowerFileUrl = fileUrl.toLowerCase();
    const isPdf = lowerFileUrl.includes('.pdf') || lowerFileUrl.includes('application/pdf');

    if (isPdf) {
      return (
        <iframe
          src={fileUrl}
          title={title || 'Medical document preview'}
          className="w-full h-full min-h-[360px] rounded-2xl bg-white"
        />
      );
    }

    return (
      <div className="relative w-full h-full min-h-[360px] rounded-2xl overflow-hidden bg-slate-100">
        <Image
          src={fileUrl}
          alt={title || 'Medical document preview'}
          fill
          className="object-contain"
        />
      </div>
    );
  };

  
  if (isLoadingPatients) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div>
          <Link
            href="/doctor/patients"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-normal text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Patient Roster
          </Link>
        </div>
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xs flex items-center justify-center min-h-[300px]">
          <div className="flex items-center gap-2 text-slate-500 font-normal text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-[#0149ff]" />
            Loading patient details...
          </div>
        </div>
      </div>
    );
  }

  if (!livePatientRecord) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div>
          <Link
            href="/doctor/patients"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-normal text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Patient Roster
          </Link>
        </div>
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xs flex flex-col items-center justify-center min-h-[300px] text-center">
          <AlertCircle className="w-8 h-8 text-slate-400 mb-3" />
          <h2 className="text-lg font-normal text-slate-900 mb-1">Patient not found</h2>
          <p className="text-sm text-slate-500 font-normal">
            {patientsError || "We couldn't find this patient's records."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white transition-all duration-300 transform translate-y-0 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm font-normal">{toast.message}</span>
        </div>
      )}

      {/* Navigation Top Link */}
      <div>
        <Link
          href="/doctor/patients"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-normal text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patient Roster
        </Link>
      </div>

      {/* CARD 1: Top Patient Header Card */}
      <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xs">
        <div className='bg-[#FCFCFC] p-4 rounded-md'>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            {/* Patient Info Left */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border border-slate-100 shadow-2xs shrink-0 bg-slate-200 flex items-center justify-center text-slate-700 font-medium text-lg">
                {patient.avatar ? (
                  <Image
                    src={patient.avatar}
                    alt={patient.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span>{patient.name.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div>
                <h1 className="text-xl md:text-2xl font-normal text-slate-900">{patient.name}</h1>
                <p className="text-xs md:text-sm text-slate-500 font-normal">
                  {patient.gender}, {patient.age ?? '—'} · {patient.bloodType}
                </p>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Patient since {patient.since}
                </p>
              </div>
            </div>

            {/* Action Buttons Right */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMessageOpen(true)}
                className="bg-[#eef4ff] hover:bg-[#e2edff] text-[#0149ff] font-normal text-xs md:text-sm px-4 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> Message
              </button>

              <button
                type="button"
                onClick={() => setIsAddNoteOpen(true)}
                className="bg-[#f80400] hover:bg-[#d80300] text-white font-normal text-xs md:text-sm px-4 py-2.5 rounded-xl transition-colors shadow-xs inline-flex items-center gap-2"
              >
                <FileArchive className="w-4 h-4" /> Add Medical File/Note
              </button>
            </div>
          </div>

          {/* Bottom Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div>
              <span className="block text-xs text-slate-400 font-normal mb-1">Contact</span>
              <p className="text-xs md:text-sm text-slate-800 font-normal">{patient.contact}</p>
            </div>

            <div>
              <span className="block text-xs text-slate-400 font-normal mb-1">Address</span>
              <p className="text-xs md:text-sm text-slate-800 font-normal">{patient.address}</p>
            </div>

            <div>
              <span className="block text-xs text-slate-400 font-normal mb-1">Conditions</span>
              <p className="text-xs md:text-sm font-normal text-[#0149ff] hover:underline cursor-pointer">
                {patient.condition}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROW 2: Two Cards (Latest Vital Signs & Visit Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Latest Vital Signs */}
        <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-5">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
            <h2 className="text-base md:text-lg font-normal text-slate-900">Latest Vital Signs</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {/* Blood Pressure */}
            <div className="bg-[#EFEFEF] rounded-xl p-4 border border-slate-100/80">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-normal text-emerald-600">Normal</span>
              </div>
              <p className="text-lg md:text-xl font-normal text-slate-900">
                {displayedVitals.bp}
                <span className="text-xs font-normal text-slate-500 ml-1">mmHg</span>
              </p>
              <p className="text-xs text-slate-500 font-normal mt-1">Blood Pressure</p>
            </div>

            {/* Heart Rate */}
            <div className="bg-[#EFEFEF] rounded-xl p-4 border border-slate-100/80">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-normal text-emerald-600">Normal</span>
              </div>
              <p className="text-lg md:text-xl font-normal text-slate-900">
                {displayedVitals.hr}
                <span className="text-xs font-normal text-slate-500 ml-1">bpm</span>
              </p>
              <p className="text-xs text-slate-500 font-normal mt-1">Heart Rate</p>
            </div>

            {/* Weight */}
            <div className="bg-[#EFEFEF] rounded-xl p-4 border border-slate-100/80">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-normal text-emerald-600">Normal</span>
              </div>
              <p className="text-lg md:text-xl font-normal text-slate-900">
                {displayedVitals.weight}
                <span className="text-xs font-normal text-slate-500 ml-1">kg</span>
              </p>
              <p className="text-xs text-slate-500 font-normal mt-1">Weight</p>
            </div>

            {/* Primary Biomarker */}
            <div className="bg-[#EFEFEF] rounded-xl p-4 border border-slate-100/80">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-normal text-emerald-600">Normal</span>
              </div>
              <p className="text-lg md:text-xl font-normal text-slate-900">{displayedVitals.tsh}</p>
              <p className="text-xs text-slate-500 font-normal mt-1">
                {displayedVitals.biomarkerName}
              </p>
            </div>
          </div>
        </section>

        {/* Right Card: Visit Summary */}
        <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-[#0149ff]" />
            <h2 className="text-base md:text-lg font-normal text-slate-900">Visit Summary</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {/* Total Visits */}
            <div className="bg-[#EFEFEF] rounded-xl p-4 border border-slate-100/80">
              <p className="text-xl md:text-2xl font-normal text-slate-900 mb-1">
                {patient.summary?.totalVisits ?? '—'}
              </p>
              <p className="text-xs text-slate-500 font-normal">Total Visits</p>
            </div>

            {/* Last Visit */}
            <div className="bg-[#EFEFEF] rounded-xl p-4 border border-slate-100/80">
              <p className="text-base md:text-lg font-normal text-slate-900 mb-1">
                {patient.summary?.lastVisit ?? '—'}
              </p>
              <p className="text-xs text-slate-500 font-normal">Last Visit</p>
            </div>

            {/* Next Appointment */}
            <div className="bg-[#EFEFEF] rounded-xl p-4 border border-slate-100/80">
              <p className="text-base md:text-lg font-normal text-slate-900 mb-1">
                {patient.summary?.nextAppointment ?? '—'}
              </p>
              <p className="text-xs text-slate-500 font-normal">Next Appointment</p>
            </div>

            {/* Medical Records */}
            <div className="bg-[#EFEFEF] rounded-xl p-4 border border-slate-100/80">
              <p className="text-xl md:text-2xl font-normal text-slate-900 mb-1">
                {displayedMedicalRecords.length}
              </p>
              <p className="text-xs text-slate-500 font-normal">Medical Records</p>
            </div>
          </div>
        </section>
      </div>

      {/* CARD 3: Vitals Tracking History */}
      <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xs">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-5 h-5 text-[#0149ff]" />
          <h2 className="text-base md:text-lg font-normal text-slate-900">Vitals Tracking History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-normal text-slate-500">
                <th className="pb-3">Date</th>
                <th className="pb-3">Weight</th>
                <th className="pb-3">Temp</th>
                <th className="pb-3">HR</th>
                <th className="pb-3">BP</th>
                <th className="pb-3">FBS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs md:text-sm">
              {displayedVitalHistory.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 font-normal text-slate-900">{row.date}</td>
                  <td className="py-3 text-slate-700 font-normal">{row.weight}</td>
                  <td className="py-3 text-slate-700 font-normal">{row.temp}</td>
                  <td className="py-3 text-slate-700 font-normal">{row.hr}</td>
                  <td className="py-3 text-slate-700 font-normal">{row.bp}</td>
                  <td className="py-3 text-slate-700 font-normal">{row.fbs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CARD 4: Medical Records */}
      <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xs">
        <h2 className="text-base md:text-lg font-normal text-slate-900 mb-5">Medical Records</h2>

        <div className="space-y-3">
          {isLoadingMedicalRecords || isLoadingPatientUploads ? (
            <p className="text-sm text-slate-500 font-normal">Loading medical records...</p>
          ) : displayedMedicalRecords.length === 0 ? (
            <p className="text-sm text-slate-500 font-normal">No medical records uploaded yet.</p>
          ) : (
            displayedMedicalRecords.map((record) => (
              <div
                key={record.id}
                className="border border-slate-100 rounded-xl p-4 flex items-center justify-between hover:border-slate-200 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <FileText className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-normal text-slate-900">
                      {record.title} - <span className="text-[#0149ff] font-normal">{record.type}</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      {record.date} · {record.details}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingRecord(record)}
                  className="bg-[#eef4ff] hover:bg-[#e2edff] text-[#0149ff] text-xs font-normal px-4 py-1.5 rounded-lg transition-colors shrink-0"
                >
                  View
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* CARD 5: Visit History */}
      <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xs">
        <h2 className="text-base md:text-lg font-normal text-slate-900 mb-5">Visit History</h2>

        <div className="space-y-3">
          {patient.visitHistory?.length ? (
            patient.visitHistory.map((visit, idx) => (
              <div
                key={idx}
                className="bg-slate-50/70 rounded-xl p-4 flex items-start gap-4 border border-slate-100"
              >
                <div className="min-w-[70px]">
                  <span className="block text-sm font-normal text-slate-900">{visit.date}</span>
                  <span className="text-xs text-slate-400 font-normal">{visit.year}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm md:text-base font-normal text-slate-900">
                    {visit.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 font-normal mt-1">
                    {visit.summary}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 font-normal">No visit history recorded yet.</p>
          )}
        </div>
      </section>

      {/* MODAL 1: Add Medical File/Note */}
      {isAddNoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-normal text-slate-900">Add Medical File / Note</h3>
              <button
                onClick={() => { setIsAddNoteOpen(false); setNoteForm(EMPTY_NOTE); }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* hidden real file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setNoteForm((prev) => ({ ...prev, file: f }));
              }}
            />

            <form onSubmit={handleSaveNote} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blood Work Request"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0149ff] focus:outline-none font-normal"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1">Category *</label>
                <select
                  value={noteForm.category}
                  onChange={(e) =>
                    setNoteForm((prev) => ({
                      ...prev,
                      category: e.target.value as MedicalDocumentCategory,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0149ff] focus:outline-none bg-white font-normal"
                >
                  <option value="lab_order">Lab Order</option>
                  <option value="prescription">Prescription</option>
                  <option value="referral">Referral</option>
                  <option value="clinical_note">Clinical Note</option>
                </select>
              </div>

              {/* Per-category detail fields */}
              {noteForm.category === 'lab_order' && (
                <>
                  <div>
                    <label className="block text-xs font-normal text-slate-600 mb-1">Test Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Complete Blood Count (CBC)"
                      value={noteForm.test_name}
                      onChange={(e) => setNoteForm((prev) => ({ ...prev, test_name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0149ff] focus:outline-none font-normal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-normal text-slate-600 mb-1">Instructions</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Fasting required for 8 hours"
                      value={noteForm.instructions}
                      onChange={(e) => setNoteForm((prev) => ({ ...prev, instructions: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0149ff] focus:outline-none resize-none font-normal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-normal text-slate-600 mb-1">Status *</label>
                    <select
                      value={noteForm.lab_status}
                      onChange={(e) =>
                        setNoteForm((prev) => ({
                          ...prev,
                          lab_status: e.target.value as MedicalDocumentStatus,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0149ff] focus:outline-none bg-white font-normal"
                    >
                      <option value="ordered">Ordered</option>
                      <option value="result_uploaded">Result Uploaded</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </>
              )}

              {noteForm.category === 'prescription' && (
                <div>
                  <label className="block text-xs font-normal text-slate-600 mb-1">
                    Medications * <span className="text-slate-400 font-normal">(one per line)</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder={'Amoxicillin 500mg — twice daily for 7 days\nIbuprofen 400mg — as needed for pain'}
                    value={noteForm.medications}
                    onChange={(e) => setNoteForm((prev) => ({ ...prev, medications: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0149ff] focus:outline-none resize-none font-normal"
                  />
                </div>
              )}

              {noteForm.category === 'referral' && (
                <>
                  <div>
                    <label className="block text-xs font-normal text-slate-600 mb-1">Referred To *</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Akin — Cardiology"
                      value={noteForm.referred_to}
                      onChange={(e) => setNoteForm((prev) => ({ ...prev, referred_to: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0149ff] focus:outline-none font-normal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-normal text-slate-600 mb-1">Reason *</label>
                    <textarea
                      rows={3}
                      placeholder="Reason for referral..."
                      value={noteForm.referral_reason}
                      onChange={(e) => setNoteForm((prev) => ({ ...prev, referral_reason: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0149ff] focus:outline-none resize-none font-normal"
                    />
                  </div>
                </>
              )}

              {noteForm.category === 'clinical_note' && (
                <div>
                  <label className="block text-xs font-normal text-slate-600 mb-1">Content *</label>
                  <textarea
                    rows={4}
                    placeholder="Enter clinical observations, assessment, and plan..."
                    value={noteForm.content}
                    onChange={(e) => setNoteForm((prev) => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0149ff] focus:outline-none resize-none font-normal"
                  />
                </div>
              )}

              {/* PDF upload area */}
              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1">
                  PDF Attachment *
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-4 text-center hover:bg-slate-50 transition-colors ${
                    noteForm.file ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200'
                  }`}
                >
                  {noteForm.file ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-600 text-xs font-normal">
                      <CheckCircle2 className="w-4 h-4" />
                      {noteForm.file.name}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="w-5 h-5 text-slate-400" />
                      <span className="text-xs text-slate-600 font-normal">
                        Click to attach a PDF <span className="text-[#0149ff]">(max 10 MB)</span>
                      </span>
                    </div>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsAddNoteOpen(false); setNoteForm(EMPTY_NOTE); }}
                  className="px-4 py-2 text-xs font-normal text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingDoc}
                  className="px-5 py-2 text-xs font-normal text-white bg-[#f80400] hover:bg-[#d80300] rounded-xl shadow-xs inline-flex items-center gap-1.5 disabled:opacity-70"
                >
                  {isUploadingDoc && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isUploadingDoc ? 'Uploading...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Message Patient */}
      {isMessageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-100 relative bg-slate-200 flex items-center justify-center text-slate-700 font-medium text-xs">
                  {patient.avatar ? (
                    <Image
                      src={patient.avatar}
                      alt={patient.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>{patient.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-normal text-slate-900">Message {patient.name}</h3>
                  <p className="text-xs text-slate-400 font-normal">Direct Patient Communication</p>
                </div>
              </div>
              <button
                onClick={() => setIsMessageOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <textarea
                  rows={4}
                  required
                  placeholder={`Type your message to ${patient.name}...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0149ff] focus:outline-none resize-none font-normal"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMessageOpen(false)}
                  className="px-4 py-2 text-xs font-normal text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-normal text-white bg-[#0149ff] hover:bg-blue-700 rounded-xl shadow-xs inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Medical Record File Viewer Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-slate-100/80 animate-scaleUp">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-100/90 border border-slate-200/50 flex items-center justify-center text-slate-600 shrink-0">
                  <FileText className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-normal text-slate-900">
                    {viewingRecord.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 font-normal mt-0.5">
                    {viewingRecord.type} · {viewingRecord.date} ·{' '}
                    {viewingRecord.author || 'Emily Rodriguez'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintRecord}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors focus:outline-none"
                  title="Print Document"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewingRecord(null)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Preview */}
            <div className="w-full rounded-2xl border border-slate-200/80 overflow-hidden mb-6 bg-slate-100 shadow-inner flex items-center justify-center">
              {getPreviewForRecord(viewingRecord.fileUrl, viewingRecord.title)}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-xs md:text-sm text-slate-600 font-normal">
                {viewingRecord.details}
              </p>

              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="bg-[#0149ff] hover:bg-blue-700 text-white font-normal px-7 py-2.5 rounded-xl text-sm transition-colors shadow-xs shrink-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
