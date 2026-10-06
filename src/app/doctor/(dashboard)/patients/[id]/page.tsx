'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  Send,
  Printer,
} from 'lucide-react';
import { mockPatientsList, PatientData, MedicalRecordItem } from '@/data/patientsData';
import {
  formatPatientSince,
  formatPatientStatus,
  getAgeFromDob,
  getPrimaryImage,
  resolveValue,
  usePatients,
} from '@/src/hooks/usePatients';

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
    isLoadingMedicalRecords,
    isLoadingPatientUploads,
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

  const fallbackPatient = mockPatientsList.find((p) => p.id === patientId) ?? mockPatientsList[0];

  const patient: PatientData = useMemo(() => {
    const livePatientRecord = patients.find((patientRecord) => patientRecord.id === patientId) ?? null;

    if (!livePatientRecord) {
      return fallbackPatient;
    }

    const computedAge = livePatientRecord.date_of_birth ? getAgeFromDob(livePatientRecord.date_of_birth) : null;
    const avatarSource = getPrimaryImage(livePatientRecord, '');
    const createdAtText = formatPatientSince(livePatientRecord.created_at);
    const activeCondition = formatPatientStatus(livePatientRecord.status);

    return {
      ...fallbackPatient,
      id: livePatientRecord.id,
      name: resolveValue(livePatientRecord.full_name, fallbackPatient.name),
      avatar: avatarSource,
      gender: resolveValue(livePatientRecord.gender, fallbackPatient.gender),
      age: computedAge !== null && computedAge !== undefined ? computedAge : fallbackPatient.age,
      bloodType: resolveValue(livePatientRecord.blood_group, fallbackPatient.bloodType),
      contact: resolveValue(livePatientRecord.phone, fallbackPatient.contact),
      address: resolveValue(livePatientRecord.address, fallbackPatient.address),
      since: createdAtText,
      condition: activeCondition,
      lastVisit: fallbackPatient.lastVisit,
      nextAppointment: fallbackPatient.nextAppointment,
      summary: fallbackPatient.summary,
      vitals: fallbackPatient.vitals,
      vitalsHistory: fallbackPatient.vitalsHistory,
      medicalRecords: fallbackPatient.medicalRecords,
      visitHistory: fallbackPatient.visitHistory,
    };
  }, [fallbackPatient, patientId, patients]);

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

  const displayedMedicalRecords = useMemo(() => {
    const adminRecords = medicalRecords.map((record) => {
      const recordType =
        record.category === 'prescription'
          ? 'Prescription'
          : record.category === 'lab_result'
            ? 'Lab Result'
            : record.category === 'imaging_report'
              ? 'Imaging Report'
              : record.category === 'clinical_note'
                ? 'Clinical Progress Note'
                : 'Clinical Progress Note';

      const details = typeof record.details === 'string'
        ? record.details
        : record.details && typeof record.details === 'object'
          ? JSON.stringify(record.details)
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
      type: upload.category === 'lab_result_scan' ? 'Lab Result' : 'General',
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

  // Form states
  const [noteForm, setNoteForm] = useState({
    title: '',
    type: 'Lab Result',
    notes: '',
  });

  const [messageText, setMessageText] = useState('');

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.title || !noteForm.notes) return;
    showToast(`Medical file/note added successfully to ${patient.name}'s record!`);
    setIsAddNoteOpen(false);
    setNoteForm({ title: '', type: 'Lab Result', notes: '' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    showToast(`Message sent to ${patient.name}!`);
    setIsMessageOpen(false);
    setMessageText('');
  };

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
                  {patient.gender}, {patient.age} · {patient.bloodType}
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
                {patient.summary.totalVisits}
              </p>
              <p className="text-xs text-slate-500 font-normal">Total Visits</p>
            </div>

            {/* Last Visit */}
            <div className="bg-[#EFEFEF] rounded-xl p-4 border border-slate-100/80">
              <p className="text-base md:text-lg font-normal text-slate-900 mb-1">
                {patient.summary.lastVisit}
              </p>
              <p className="text-xs text-slate-500 font-normal">Last Visit</p>
            </div>

            {/* Next Appointment */}
            <div className="bg-[#EFEFEF] rounded-xl p-4 border border-slate-100/80">
              <p className="text-base md:text-lg font-normal text-slate-900 mb-1">
                {patient.summary.nextAppointment}
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
          {patient.visitHistory.map((visit, idx) => (
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
          ))}
        </div>
      </section>

      {/* MODAL 1: Add Medical File/Note */}
      {isAddNoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-normal text-slate-900">Add Medical File / Note</h3>
              <button
                onClick={() => setIsAddNoteOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Follow-up Lab Evaluation"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0149ff] focus:outline-none font-normal"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1">
                  Category Type
                </label>
                <select
                  value={noteForm.type}
                  onChange={(e) => setNoteForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0149ff] focus:outline-none bg-white font-normal"
                >
                  <option value="Lab Result">Lab Result</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Clinical Progress Note">Clinical Progress Note</option>
                  <option value="Imaging Report">Imaging Report</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1">
                  Clinical Notes & Observation
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter medical observations, treatment notes, or instructions..."
                  value={noteForm.notes}
                  onChange={(e) => setNoteForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#0149ff] focus:outline-none resize-none font-normal"
                />
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-xs text-slate-600 font-normal">
                  Drag & drop medical PDF or document, or <span className="text-[#0149ff]">browse</span>
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddNoteOpen(false)}
                  className="px-4 py-2 text-xs font-normal text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-normal text-white bg-[#f80400] hover:bg-[#d80300] rounded-xl shadow-xs"
                >
                  Save Record
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
