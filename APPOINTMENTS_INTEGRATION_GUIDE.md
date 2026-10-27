# 📅 Appointment & Doctor Availability API Integration Guide

This guide details all API endpoints and end-to-end integration flows for the appointment booking and doctor scheduling system in Durom's Touch Clinic (DTC).

---

## 📑 Table of Contents
1. [Overview & Core Architecture](#overview--core-architecture)
2. [Data Types & Enums](#data-types--enums)
3. [API Endpoints Reference](#api-endpoints-reference)
   - [A. Available Slots (`/api/appointments/available-slots`)](#a-available-slots)
   - [B. Doctor Availability (`/api/appointments/availability`)](#b-doctor-availability)
   - [C. Appointments Collection (`/api/appointments`)](#c-appointments-collection)
   - [D. Single Appointment Operations (`/api/appointments/[id]`)](#d-single-appointment-operations)
4. [Step-by-Step Frontend Integration Workflows](#step-by-step-frontend-integration-workflows)
   - [Flow 1: Patient Booking Modal Flow (4 Steps + Payment)](#flow-1-patient-booking-modal-flow)
   - [Flow 2: Doctor Settings Availability Flow](#flow-2-doctor-settings-availability-flow)
   - [Flow 3: Patient Cancelling an Appointment](#flow-3-patient-cancelling-an-appointment)

---

## 1. Overview & Core Architecture

* **Doctor Schedule vs. Booking:** The doctor defines weekly working blocks (e.g. *Monday 8:00 AM - 12:00 PM*). These are recurring templates. When a patient books, an exact UTC ISO timestamp is saved in `scheduled_at` (e.g. `2026-11-04T09:00:00.000Z`), so past weeks never collide with future weeks.
* **Slot Duration:** Slot intervals (30 min, 45 min, 60 min, etc.) are determined dynamically based on the chosen `service_id` (`services.duration_minutes`).
* **Conflict Prevention:** Slots that are already booked (`confirmed`, `pending_approval`, `completed`) or actively held (`pending_payment` < 15 mins) are automatically filtered out by the backend.
* **Payment Flow:** When a patient books an appointment, the backend initializes a Paystack transaction and returns a `paymentUrl`. Upon successful payment on Paystack, the user is redirected to `/user/confirm`, which triggers `/api/payments/verify`, moving the appointment status to `pending_approval`.

---

## 2. Data Types & Enums

```typescript
export type AppointmentStatus =
  | 'pending_payment'   // Awaiting Paystack payment
  | 'pending_approval'  // Paid by patient; awaiting doctor review
  | 'confirmed'         // Approved by doctor or booked directly by admin
  | 'declined'          // Declined by doctor
  | 'completed'         // Consultation completed
  | 'cancelled'         // Cancelled by patient or doctor
  | 'missed';           // Patient missed the session

export interface AvailableSlot {
  time: string;       // 24-hr string: "09:00"
  label: string;      // 12-hr display label: "9:00 AM"
  start_iso: string;  // Full ISO string: "2026-11-04T09:00:00.000Z"
  available: boolean;
}

export interface DayAvailableSlots {
  date: string;            // "2026-11-04"
  day: string;             // "Wednesday"
  available_count: number; // e.g. 4
  slots: AvailableSlot[];
}
```

---

## 3. API Endpoints Reference

### A. Available Slots

#### `GET /api/appointments/available-slots`
Calculates real-time available slots by comparing doctor working blocks against existing bookings and past time.

* **Query Parameters:**
  | Param | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `date` | `string` | Optional | Date in `YYYY-MM-DD` format (for single day lookup). |
  | `days` | `number` | Optional | Number of days to calculate from `start_date` (default: `7`, max: `30`). |
  | `start_date` | `string` | Optional | Start date in `YYYY-MM-DD` format (defaults to today). |
  | `service_id` | `string` | Recommended | UUID of selected service (uses `duration_minutes` for slot sizing). |
  | `clinician_id`| `string`| Optional | Clinician UUID (defaults to default clinic doctor). |

* **Example 1: Fetching Range (Used for Date Selection in Modal)**
  ```http
  GET /api/appointments/available-slots?days=7&service_id=b2e4f5a1-0000-0000-0000-000000000000
  ```
  **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "date": "2026-11-04",
        "day": "Wednesday",
        "available_count": 4,
        "slots": [
          { "time": "09:00", "label": "9:00 AM", "start_iso": "2026-11-04T09:00:00.000Z", "available": true },
          { "time": "10:00", "label": "10:00 AM", "start_iso": "2026-11-04T10:00:00.000Z", "available": true },
          { "time": "14:00", "label": "2:00 PM", "start_iso": "2026-11-04T14:00:00.000Z", "available": true },
          { "time": "15:00", "label": "3:00 PM", "start_iso": "2026-11-04T15:00:00.000Z", "available": true }
        ]
      },
      {
        "date": "2026-11-05",
        "day": "Thursday",
        "available_count": 0,
        "slots": []
      }
    ]
  }
  ```

* **Example 2: Fetching Single Day (Used when patient picks a specific date)**
  ```http
  GET /api/appointments/available-slots?date=2026-11-04&service_id=b2e4f5a1-0000-0000-0000-000000000000
  ```
  **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "date": "2026-11-04",
      "day": "Wednesday",
      "service_duration": 60,
      "slots": [
        { "time": "09:00", "label": "9:00 AM", "start_iso": "2026-11-04T09:00:00.000Z", "available": true },
        { "time": "10:00", "label": "10:00 AM", "start_iso": "2026-11-04T10:00:00.000Z", "available": true }
      ]
    }
  }
  ```

---

### B. Doctor Availability

#### `GET /api/appointments/availability`
Fetches weekly availability schedule for the doctor (Sunday - Saturday).
* **Headers:** `Cookie` (authenticated session)
* **Query Parameters:** `clinician_id` (optional, defaults to logged-in user or clinic admin).
* **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "day": "Monday",
        "day_of_week": 1,
        "active": true,
        "slots": [
          { "start": "8:00 AM", "end": "12:00 PM" },
          { "start": "2:00 PM", "end": "5:00 PM" }
        ]
      },
      {
        "day": "Tuesday",
        "day_of_week": 2,
        "active": false,
        "slots": []
      }
    ]
  }
  ```

#### `PUT /api/appointments/availability`
Saves/updates the doctor's weekly routine. Clears previous schedule blocks and replaces them.
* **Permission:** Admin / Clinician only.
* **Payload:**
  ```json
  {
    "schedule": [
      {
        "day": "Monday",
        "day_of_week": 1,
        "active": true,
        "slots": [
          { "start": "8:00 AM", "end": "12:00 PM" },
          { "start": "2:00 PM", "end": "5:00 PM" }
        ]
      },
      {
        "day": "Tuesday",
        "day_of_week": 2,
        "active": false,
        "slots": []
      }
    ]
  }
  ```
  *(Note: `start` and `end` can be 12-hour `"8:00 AM"` or 24-hour `"08:00"` format; the backend parses both).*
* **Response `200 OK`:**
  ```json
  { "success": true, "message": "Availability updated successfully" }
  ```

---

### C. Appointments Collection

#### `GET /api/appointments`
Fetches a list of appointments. Non-admins only receive their own appointments due to Supabase RLS.
* **Query Parameters:**
  * `patient_id` (optional): Filter by specific patient.
  * `status` (optional): Filter by status (`pending_approval`, `confirmed`, etc.).
  * `upcoming` (optional, `"true"`): Returns appointments with `scheduled_at >= NOW()` excluding cancelled/declined.
* **Response `200 OK`:**
  ```json
  {
    "data": [
      {
        "id": "7c28bf9e-1111-2222-3333-444455556666",
        "patient_id": "...",
        "clinician_id": "...",
        "service_id": "...",
        "scheduled_at": "2026-11-04T09:00:00.000Z",
        "status": "confirmed",
        "reason": "Follow-up consultation",
        "meeting_link": "https://meet.google.com/xyz-abcd-efg",
        "services": {
          "id": "...",
          "name": "General Consultation",
          "price": 49.00,
          "duration_minutes": 30
        },
        "profiles": {
          "id": "...",
          "full_name": "Dr. Stephen Adeyemi",
          "avatar_url": "/images/stephen.jpg"
        }
      }
    ]
  }
  ```

#### `POST /api/appointments`
Creates an appointment booking and initializes Paystack payment.
* **Payload:**
  ```json
  {
    "service_id": "b2e4f5a1-0000-0000-0000-000000000000",
    "scheduled_at": "2026-11-04T09:00:00.000Z",
    "reason": "Persistent back pain evaluation",
    "patient_upload_id": "optional-uuid-of-symptom-upload"
  }
  ```
* **Response `201 Created` (For Patient):**
  ```json
  {
    "success": true,
    "data": {
      "id": "7c28bf9e-1111-2222-3333-444455556666",
      "status": "pending_payment",
      "scheduled_at": "2026-11-04T09:00:00.000Z"
    },
    "paymentUrl": "https://checkout.paystack.com/390g1kd9a",
    "reference": "APP-7c28bf9e-1111-2222-3333-444455556666-1730048123000"
  }
  ```
* **Response `201 Created` (For Admin booking on behalf of patient):**
  * Status is set directly to `confirmed`. `paymentUrl` is `null`.

---

### D. Single Appointment Operations

#### `GET /api/appointments/[id]`
Fetches details of a single appointment by UUID.
* **Response `200 OK`:** Full appointment object with joined `services` and `profiles:clinician_id`.

#### `PATCH` / `PUT /api/appointments/[id]`
Updates an appointment:
1. **If caller is Patient:**
   * Only allowed to cancel their own appointment.
   * Payload:
     ```json
     {
       "status": "cancelled",
       "cancellation_reason": "I have an emergency at work"
     }
     ```
2. **If caller is Admin / Doctor:**
   * Can update status (`confirmed`, `declined`, `completed`), `meeting_link`, `completion_note`, or reschedule `scheduled_at`.
   * Payload:
     ```json
     {
       "status": "confirmed",
       "meeting_link": "https://meet.google.com/dr-stephen-consult"
     }
     ```

---

## 4. Step-by-Step Frontend Integration Workflows

### Flow 1: Patient Booking Modal Flow

Integrate inside `src/components/common/BookAppointmentModal.tsx`:

```
[ Step 1: Services ] ➔ [ Step 2: Date Picker ] ➔ [ Step 3: Time Slot Picker ] ➔ [ Step 4: Reason & Submit ]
```

1. **Step 1 (Select Service):**
   * Fetch services list from `/api/services`.
   * When user clicks a service: Save `selectedService` and advance to Step 2.

2. **Step 2 (Select Date):**
   * Call `/api/appointments/available-slots?days=7&service_id=${selectedService.id}`.
   * Render the upcoming dates. Display `available_count` (e.g. `"4 slots available"`).
   * When user clicks a date card: Save `selectedDate` and advance to Step 3.

3. **Step 3 (Select Time):**
   * Retrieve the `slots` array for that date from the Step 2 response (or query `/api/appointments/available-slots?date=${selectedDate}&service_id=${selectedService.id}`).
   * Render buttons for each slot (e.g. `slot.label` = `"9:00 AM"`).
   * When user clicks a time: Save `selectedSlot` (store `start_iso`) and advance to Step 4.

4. **Step 4 (Reason & Confirm Booking):**
   * User inputs optional visit reason.
   * On click **"Confirm Booking"**:
     ```typescript
     const res = await fetch('/api/appointments', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         service_id: selectedService.id,
         scheduled_at: selectedSlot.start_iso,
         reason: reasonText,
       }),
     });
     const data = await res.json();

     if (!res.ok) {
       toast.error(data.error || 'Failed to book slot');
       return;
     }

     // Redirect patient to Paystack Checkout URL
     if (data.paymentUrl) {
       window.location.href = data.paymentUrl;
     }
     ```

5. **Payment Completion:**
   * Patient completes payment on Paystack.
   * Paystack redirects patient to `/user/confirm?reference=APP-...`.
   * The confirmation page calls `POST /api/payments/verify`, which updates the appointment status in the database to `pending_approval`.

---

### Flow 2: Doctor Settings Availability Flow

Integrate inside `src/app/doctor/(dashboard)/settings/page.tsx`:

1. **On Page Load:**
   ```typescript
   useEffect(() => {
     async function loadSchedule() {
       const res = await fetch('/api/appointments/availability');
       const json = await res.json();
       if (json.success && json.data.length > 0) {
         setAvailability(json.data);
       }
     }
     loadSchedule();
   }, []);
   ```

2. **On Save Schedule in Modal (`handleSaveSchedule`):**
   ```typescript
   const handleSaveSchedule = async () => {
     try {
       const res = await fetch('/api/appointments/availability', {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ schedule: tempAvailability }),
       });
       const data = await res.json();
       if (!res.ok) throw new Error(data.error);

       setAvailability(tempAvailability);
       setIsScheduleModalOpen(false);
       toast.success('Weekly schedule saved successfully!');
     } catch (err: any) {
       toast.error(err.message || 'Failed to save schedule');
     }
   };
   ```

---

### Flow 3: Patient Cancelling an Appointment

From `/user/appointments` or the appointment card:

```typescript
const handleCancel = async (appointmentId: string, reason: string) => {
  const res = await fetch(`/api/appointments/${appointmentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'cancelled',
      cancellation_reason: reason,
    }),
  });

  if (res.ok) {
    toast.success('Appointment cancelled. The slot has been released.');
    // Re-fetch appointments
  } else {
    toast.error('Failed to cancel appointment');
  }
};
```

