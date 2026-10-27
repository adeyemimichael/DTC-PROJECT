'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, Button, Input } from '@/components/ui';
import { useVitals } from '@/src/hooks/useVitals';
import { InitialVitalsModal } from '@/src/components/common';
import {
  useMedicalDocuments,
  categoryLabel,
  type MedicalDocument,
} from '@/hooks';
import { getSignedUrl } from '@/lib/utils/storage';
import {
  Heart,
  Thermometer,
  Activity,
  Droplet,
  FolderOpen,
  Search,
  MessageSquare,
  FileText,
  Weight,
  Plus,
  Loader2,
  X,
  Printer,
} from 'lucide-react';

interface Vital {
  name: string;
  value: string;
  status: string;
  range?: string;
  icon: React.ElementType;
}


const CATEGORIES = [
  { label: 'All Records',   value: 'all'           },
  { label: 'Lab Order',     value: 'lab_order'     },
  { label: 'Prescription',  value: 'prescription'  },
  { label: 'Referral',      value: 'referral'      },
  { label: 'Clinical Note', value: 'clinical_note' },
] as const;

type CategoryValue = (typeof CATEGORIES)[number]['value'];

/** Colour theme per DB category */
function getCategoryTheme(category: string) {
  switch (category) {
    case 'lab_order':     return { text: 'text-primary-blue', dot: 'bg-primary-blue' };
    case 'prescription':  return { text: 'text-indigo-500',   dot: 'bg-indigo-500'   };
    case 'referral':      return { text: 'text-amber-500',    dot: 'bg-amber-500'    };
    case 'clinical_note': return { text: 'text-emerald-500',  dot: 'bg-emerald-500'  };
    default:              return { text: 'text-slate-500',    dot: 'bg-slate-500'    };
  }
}

/** Status badge only shown for lab_order records */
function getStatusBadge(status: string | null | undefined) {
  switch (status) {
    case 'ordered':
      return { label: 'Ordered',         className: 'bg-amber-100 text-amber-700'    };
    case 'result_uploaded':
      return { label: 'Result Uploaded', className: 'bg-blue-100 text-blue-700'      };
    case 'completed':
      return { label: 'Completed',       className: 'bg-emerald-100 text-emerald-700'};
    default:
      return null;
  }
}


function formatDetails(category: string, details: Record<string, unknown>): string {
  if (!details || typeof details !== 'object') return '';
  switch (category) {
    case 'lab_order': {
      const parts: string[] = [];
      if (details.test_name)   parts.push(`Test: ${details.test_name}`);
      if (details.instructions) parts.push(`Instructions: ${details.instructions}`);
      return parts.join(' · ');
    }
    case 'prescription': {
      const meds = Array.isArray(details.medications)
        ? (details.medications as string[]).join(', ')
        : String(details.medications ?? '');
      return meds ? `Medications: ${meds}` : '';
    }
    case 'referral': {
      const parts: string[] = [];
      if (details.referred_to) parts.push(`Referred to: ${details.referred_to}`);
      if (details.reason)      parts.push(`Reason: ${details.reason}`);
      return parts.join(' · ');
    }
    case 'clinical_note':
      return String(details.content ?? '');
    default:
      return Object.values(details).join(' · ');
  }
}

export default function MedicalInfoPage() {
  const [searchQuery,     setSearchQuery]     = useState('');
  const [activeCategory,  setActiveCategory]  = useState<CategoryValue>('all');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const { latestVital, isLoading: isLoadingVitals, createVital } = useVitals();

  // Real records — no patient_id: route resolves to signed-in user
  const { documents, isLoadingDocuments, documentsError, fetchDocuments } =
    useMedicalDocuments();

  useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  // ── Document viewer ───────────────────────────────────────────────────────
  const [viewingRecord, setViewingRecord] = useState<MedicalDocument | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [isLoadingViewerUrl, setIsLoadingViewerUrl] = useState(false);

  const handleViewRecord = async (rec: MedicalDocument) => {
    setViewingRecord(rec);
    setViewerUrl(null);
    if (rec.pdf_storage_path) {
      setIsLoadingViewerUrl(true);
      const url = await getSignedUrl('medical-documents', rec.pdf_storage_path);
      setViewerUrl(url);
      setIsLoadingViewerUrl(false);
    }
  };

  const handleCloseViewer = () => {
    setViewingRecord(null);
    setViewerUrl(null);
  };

  // ── Vitals ───────────────────────────────────────────────────────────────
  const displayVitals: Vital[] = latestVital
    ? [
        {
          name: 'Blood Pressure',
          value: `${latestVital.blood_pressure_systolic}/${latestVital.blood_pressure_diastolic} mmHg`,
          status: 'Normal', range: '90/60 - 120/80', icon: Heart,
        },
        {
          name: 'Heart Rate',
          value: `${latestVital.heart_rate_bpm} bpm`,
          status: 'Normal', range: '60 - 100', icon: Heart,
        },
        {
          name: 'Body Temperature',
          value: `${latestVital.temperature_c} °C`,
          status: 'Normal', range: '36.5 - 37.5', icon: Thermometer,
        },
        {
          name: 'Oxygen Saturation',
          value: latestVital.spo2_percent ? `${latestVital.spo2_percent}%` : 'N/A',
          status: latestVital.spo2_percent ? 'Normal' : 'Not set',
          range: '95 - 100', icon: Activity,
        },
        {
          name: 'Weight',
          value: `${latestVital.weight_kg} kg`,
          status: 'Normal', icon: Weight,
        },
        {
          name: 'Blood Sugar',
          value: latestVital.blood_sugar_mmol
            ? `${latestVital.blood_sugar_mmol} mmol/L` : 'N/A',
          status: latestVital.blood_sugar_mmol ? 'Normal' : 'Not set',
          range: '3.9 - 5.6', icon: Droplet,
        },
      ]
    : [];

  const recordedDateText = latestVital
    ? `Recorded ${new Date(latestVital.recorded_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })}`
    : null;


  const filteredRecords: MedicalDocument[] = documents.filter((rec) => {
    const matchesCategory =
      activeCategory === 'all' || rec.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (rec.title ?? '').toLowerCase().includes(q) ||
      (rec.clinician?.full_name ?? '').toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-page-fade">
      <InitialVitalsModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSubmitVitals={createVital}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-medium text-black tracking-tight">Medical Info</h2>
          <p className="text-sm text-primary-gray mt-1 font-semibold">
            Your health records and vitals history
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button className="btn-secondary bg-primary-blue hover:bg-[#003be6] text-white flex items-center gap-2 flex-1 sm:flex-none shadow-sm border-0">
            <MessageSquare className="h-4 w-4" />
            Message Doctor
          </Button>
        </div>
      </div>

      {/* Vitals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-black text-base">
            <Heart className="h-5 w-5 text-primary-red" />
            <h3>Latest Vital Signs</h3>
            {recordedDateText && (
              <span className="text-xs font-normal text-slate-400 ml-1">{recordedDateText}</span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRecordModalOpen(true)}
            className="flex items-center gap-1.5 text-xs text-primary-blue border-blue-200 hover:bg-blue-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Record Vitals
          </Button>
        </div>

        {isLoadingVitals ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1,2,3,4,5,6].map((i) => (
              <Card key={i} className="p-4 flex flex-col justify-between min-h-[140px] animate-pulse">
                <div className="space-y-3">
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : displayVitals.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {displayVitals.map((vital, idx) => {
              const Icon = vital.icon;
              return (
                <Card key={idx} className="p-4 flex flex-col justify-between min-h-[140px]">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-medium text-emerald-600">
                      <span className="flex items-center gap-1">
                        <Icon className="h-3.5 w-3.5" />
                        {vital.status}
                      </span>
                    </div>
                    <p className="text-lg font-medium text-black mt-3 leading-tight">{vital.value}</p>
                    <p className="text-xs font-normal text-slate-400 mt-1">{vital.name}</p>
                  </div>
                  {vital.range && (
                    <p className="text-[10px] font-normal text-slate-400/80 mt-2">{vital.range}</p>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 flex flex-col items-center justify-center text-center space-y-3 border-dashed border-slate-200">
            <div className="p-3 bg-blue-50 text-primary-blue rounded-xl">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">No vitals recorded yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                You haven&apos;t recorded your health vitals. Record your baseline vitals to keep
                your health history up to date.
              </p>
            </div>
            <Button
              onClick={() => setIsRecordModalOpen(true)}
              className="btn-primary text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 mt-2 font-bold"
            >
              <Plus className="h-3.5 w-3.5" />
              Record Initial Vitals
            </Button>
          </Card>
        )}
      </div>

      {/* Medical Records */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 font-medium text-black text-base">
            <FolderOpen className="h-5 w-5 text-primary-blue fill-secondary-blue" />
            <h3>Medical Records</h3>
          </div>
          <Input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            containerClassName="w-full sm:max-w-xs"
            className="py-2.5 text-sm bg-white"
          />
        </div>

        {/* Category pills — real DB categories only */}
        <div className="flex flex-wrap gap-2 select-none">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary-blue text-white shadow-sm'
                    : 'bg-slate-100 text-primary-gray hover:bg-slate-200 hover:text-primary-deepblue'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Records list */}
        <div className="space-y-4">
          {documentsError ? (
            <Card className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-rose-500 font-normal">{documentsError}</p>
            </Card>
          ) : isLoadingDocuments ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-400 text-sm font-normal">
              <Loader2 className="h-4 w-4 animate-spin text-primary-blue" />
              Loading your medical records...
            </div>
          ) : filteredRecords.length > 0 ? (
            filteredRecords.map((rec) => {
              const theme       = getCategoryTheme(rec.category);
              const label       = categoryLabel(rec.category);
              const statusBadge = rec.category === 'lab_order'
                ? getStatusBadge(rec.status) : null;
              const detailText  = rec.details && typeof rec.details === 'object'
                ? formatDetails(rec.category, rec.details as Record<string, unknown>)
                : typeof rec.details === 'string' ? rec.details : '';
              const formattedDate = rec.created_at
                ? new Date(rec.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })
                : '—';

              return (
                <Card
                  key={rec.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5"
                >
                  <div className="flex gap-4 min-w-0">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-black truncate">
                        {rec.title || 'Medical document'}
                      </h4>
                      <p className="text-xs font-medium text-slate-400 mt-0.5">
                        {rec.clinician?.full_name ?? 'Clinical team'} · {formattedDate}
                      </p>
                      {detailText && (
                        <p className="text-sm font-medium text-primary-gray mt-2 leading-relaxed line-clamp-2">
                          {detailText}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 w-full sm:w-auto border-t sm:border-t-0 border-slate-50 pt-4 sm:pt-0 shrink-0">
                    <span className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider ${theme.text}`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${theme.dot}`} />
                      {label}
                    </span>

                    {/* Status badge — lab_order only */}
                    {statusBadge && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge.className}`}>
                        {statusBadge.label}
                      </span>
                    )}

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleViewRecord(rec)}
                      className="bg-secondary-blue text-primary-blue hover:bg-blue-100 border-0"
                    >
                      View details
                    </Button>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-6">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-primary-deepblue">No records found</h3>
              <p className="text-sm text-primary-gray mt-2 max-w-sm font-medium">
                {searchQuery
                  ? 'Try adjusting your search or selecting a different category.'
                  : 'Your doctor has not uploaded any medical records yet.'}
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="flex items-start justify-between mb-5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-slate-900">
                    {viewingRecord.title || 'Medical document'}
                  </h3>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    {categoryLabel(viewingRecord.category)}
                    {' · '}
                    {viewingRecord.clinician?.full_name ?? 'Clinical team'}
                    {' · '}
                    {viewingRecord.created_at
                      ? new Date(viewingRecord.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {viewerUrl && (
                  <button
                    type="button"
                    onClick={() => window.print()}
                    title="Print"
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCloseViewer}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document preview area */}
            <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center min-h-[300px] mb-5">
              {isLoadingViewerUrl ? (
                <div className="flex flex-col items-center gap-2 text-slate-400 text-sm">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-blue" />
                  Loading document...
                </div>
              ) : viewerUrl ? (
                viewerUrl.toLowerCase().includes('.pdf') ||
                viewerUrl.includes('application/pdf') ||
                viewingRecord.pdf_storage_path?.endsWith('.pdf') ? (
                  <iframe
                    src={viewerUrl}
                    title={viewingRecord.title ?? 'Medical document'}
                    className="w-full h-full min-h-[360px]"
                  />
                ) : (
                  <div className="relative w-full h-full min-h-[360px]">
                    <Image
                      src={viewerUrl}
                      alt={viewingRecord.title ?? 'Medical document'}
                      fill
                      className="object-contain"
                    />
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400 text-sm font-normal text-center px-6">
                  <FileText className="w-10 h-10 text-slate-300" />
                  No file attached to this record.
                </div>
              )}
            </div>

            {/* Details footer */}
            <div className="flex items-center justify-between gap-4 shrink-0">
              <p className="text-xs text-slate-500 font-normal line-clamp-2">
                {viewingRecord.details && typeof viewingRecord.details === 'object'
                  ? formatDetails(
                      viewingRecord.category,
                      viewingRecord.details as Record<string, unknown>,
                    )
                  : typeof viewingRecord.details === 'string'
                  ? viewingRecord.details
                  : ''}
              </p>
              <button
                type="button"
                onClick={handleCloseViewer}
                className="bg-primary-blue hover:bg-[#003be6] text-white font-normal px-6 py-2.5 rounded-xl text-sm transition-colors shadow-xs shrink-0"
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
