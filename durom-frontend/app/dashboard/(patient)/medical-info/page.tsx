'use client';

import { useState } from 'react';
import { Card, Badge, Button, Input } from '@/components/ui';
import { 
  Heart, 
  Thermometer, 
  Activity, 
  Droplet, 
  FolderOpen, 
  Search, 
  Upload, 
  MessageSquare, 
  FileText,
  Weight
} from 'lucide-react';

interface Vital {
  name: string;
  value: string;
  status: string;
  range?: string;
  icon: any;
}

interface MedicalRecord {
  id: string;
  title: string;
  doctor: string;
  date: string;
  description: string;
  category: 'Laboratory' | 'Radiology' | 'Clinical Notes' | 'Prescriptions';
}

const mockVitals: Vital[] = [
  {
    name: 'Blood Pressure',
    value: '118/76 mmHg',
    status: 'Normal',
    range: '90/60 - 120/80',
    icon: Heart,
  },
  {
    name: 'Heart Rate',
    value: '72 bpm',
    status: 'Normal',
    range: '60 - 100',
    icon: Heart,
  },
  {
    name: 'Body Temperature',
    value: '98.4 °F',
    status: 'Normal',
    range: '97.0 - 99.0',
    icon: Thermometer,
  },
  {
    name: 'Oxygen Saturation',
    value: '98%',
    status: 'Normal',
    range: '95 - 100',
    icon: Activity,
  },
  {
    name: 'Weight',
    value: '142 lbs',
    status: 'Normal',
    icon: Weight,
  },
  {
    name: 'Blood Sugar',
    value: '92 mg/dL',
    status: 'Normal',
    range: '70 - 99',
    icon: Droplet,
  },
];

const mockRecords: MedicalRecord[] = [
  {
    id: '1',
    title: 'Complete Blood Count (CBC)',
    doctor: 'Dr. Stephen Adeyemi',
    date: '2026-05-18',
    description: 'All values within normal reference ranges.',
    category: 'Laboratory',
  },
  {
    id: '2',
    title: 'Lumbar Spine X-Ray',
    doctor: 'Dr. Stephen Adeyemi',
    date: '2026-05-18',
    description: 'Mild degenerative changes at L4-L5. No fractures or acute abnormalities.',
    category: 'Radiology',
  },
  {
    id: '3',
    title: 'Back Pain Evaluation Notes',
    doctor: 'Dr. Stephen Adeyemi',
    date: '2026-05-18',
    description: 'Recommended physiotherapy 2x weekly for 6 weeks. Anti-inflammatory medication prescribed.',
    category: 'Clinical Notes',
  },
  {
    id: '4',
    title: 'Cetirizine 10mg Prescription',
    doctor: 'Dr. Stephen Adeyemi',
    date: '2026-05-22',
    description: 'Take 1 tablet daily at night. Refills remaining: 3.',
    category: 'Prescriptions',
  },
];

const categories = [
  { label: 'All Records', value: 'all' },
  { label: 'Laboratory', value: 'laboratory' },
  { label: 'Radiology', value: 'radiology' },
  { label: 'Clinical Notes', value: 'clinical-notes' },
  { label: 'Prescriptions', value: 'prescriptions' },
];

export default function MedicalInfoPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Direct inline filtering logic
  const filteredRecords = mockRecords.filter((rec) => {
    const recCategorySlug = rec.category.toLowerCase().replace(' ', '-');
    const matchesCategory = activeCategory === 'all' || recCategorySlug === activeCategory;
    const matchesSearch = 
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      rec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.doctor.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesCategory && matchesSearch;
  });

  // Helpers for category visual colors
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'Laboratory':
        return { text: 'text-primary-blue', dot: 'bg-primary-blue' };
      case 'Radiology':
        return { text: 'text-amber-500', dot: 'bg-amber-500' };
      case 'Clinical Notes':
        return { text: 'text-emerald-500', dot: 'bg-emerald-500' };
      case 'Prescriptions':
        return { text: 'text-indigo-500', dot: 'bg-indigo-500' };
      default:
        return { text: 'text-slate-500', dot: 'bg-slate-500' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-page-fade">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-deepblue tracking-tight">
            Medical Info
          </h2>
          <p className="text-sm text-primary-gray mt-1 font-semibold">
            Your health records and vitals history
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button className="btn-secondary bg-primary-blue hover:bg-[#003be6] text-white flex items-center gap-2 flex-1 sm:flex-none shadow-sm border-0">
            <MessageSquare className="h-4 w-4" />
            Message Doctor
          </Button>
          <Button variant="outline" className="flex items-center gap-2 flex-1 sm:flex-none border-slate-200 hover:bg-slate-50">
            <Upload className="h-4 w-4" />
            Upload file
          </Button>
        </div>
      </div>

      {/* Vital Signs Segment */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary-deepblue font-bold text-base">
          <Heart className="h-5 w-5 text-primary-red fill-primary-red" />
          <h3>Latest Vital Signs</h3>
          <span className="text-xs font-semibold text-slate-400 ml-1">Recorded May 18, 2026</span>
        </div>

        {/* 6 Grid items */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {mockVitals.map((vital, idx) => {
            const Icon = vital.icon;
            return (
              <Card key={idx} className="p-4 flex flex-col justify-between min-h-[140px]">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Icon className="h-3.5 w-3.5" />
                      {vital.status}
                    </span>
                  </div>
                  <p className="text-lg font-extrabold text-primary-deepblue mt-3 leading-tight">{vital.value}</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">{vital.name}</p>
                </div>
                {vital.range && (
                  <p className="text-[10px] font-semibold text-slate-400/80 mt-2">{vital.range}</p>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Medical Records Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 text-primary-deepblue font-bold text-base">
            <FolderOpen className="h-5 w-5 text-primary-blue fill-secondary-blue" />
            <h3>Medical Records</h3>
          </div>
          {/* Search bar */}
          <div className="w-full sm:max-w-xs relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-slate-400 z-10" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-[10px] pl-10 pr-4 py-2 text-sm font-medium text-primary-deepblue placeholder:text-slate-400/70 transition-all duration-200 outline-none hover:border-slate-300 focus:border-primary-blue focus:ring-1 focus:ring-primary-blue"
            />
          </div>
        </div>

        {/* Category Pills Switcher */}
        <div className="flex flex-wrap gap-2 select-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
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

        {/* Records list items */}
        <div className="space-y-4">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((rec) => {
              const theme = getCategoryTheme(rec.category);
              return (
                <Card key={rec.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
                  <div className="flex gap-4 min-w-0">
                    {/* Icon card wrapper */}
                    <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-primary-deepblue truncate">{rec.title}</h4>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">{rec.doctor} · {rec.date}</p>
                      <p className="text-sm font-medium text-primary-gray mt-2 leading-relaxed">{rec.description}</p>
                    </div>
                  </div>

                  {/* Right side category & actions */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 w-full sm:w-auto border-t sm:border-t-0 border-slate-50 pt-4 sm:pt-0 shrink-0">
                    <span className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${theme.text}`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${theme.dot}`} />
                      {rec.category}
                    </span>
                    <Button variant="secondary" size="sm" className="bg-secondary-blue text-primary-blue hover:bg-blue-100 border-0">
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
              <h3 className="text-lg font-bold text-primary-deepblue">
                No records found
              </h3>
              <p className="text-sm text-primary-gray mt-2 max-w-sm font-medium">
                Try adjusting your search terms or selecting a different category filter.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
