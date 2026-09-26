'use client';

import { useState, useRef } from 'react';
import { Card, Button } from '@/components/ui';
import {
  FolderUp,
  Upload,
  FileText,
  Image as ImageIcon,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Trash2,
  Eye,
  CloudUpload,
} from 'lucide-react';
import toast from 'react-hot-toast';

type UploadCategory = 'Lab Results' | 'Imaging' | 'Prescriptions' | 'Others';

interface UploadedFile {
  id: string;
  name: string;
  category: UploadCategory;
  size: string;
  uploadedAt: string;
  type: string;
  status: 'uploaded';
}

// Mock uploaded files — these will be replaced with real API data
const mockUploads: UploadedFile[] = [
  {
    id: '1',
    name: 'Blood_Test_Results_May2026.pdf',
    category: 'Lab Results',
    size: '1.2 MB',
    uploadedAt: '2026-05-18',
    type: 'application/pdf',
    status: 'uploaded',
  },
  {
    id: '2',
    name: 'Chest_Xray_Report.jpg',
    category: 'Imaging',
    size: '3.4 MB',
    uploadedAt: '2026-05-14',
    type: 'image/jpeg',
    status: 'uploaded',
  },
  {
    id: '3',
    name: 'Cetirizine_Prescription.pdf',
    category: 'Prescriptions',
    size: '420 KB',
    uploadedAt: '2026-05-22',
    type: 'application/pdf',
    status: 'uploaded',
  },
];

const filterCategories = [
  { label: 'All Files', value: 'all' },
  { label: 'Lab Results', value: 'Lab Results' },
  { label: 'Imaging', value: 'Imaging' },
  { label: 'Prescriptions', value: 'Prescriptions' },
  { label: 'Others', value: 'Others' },
];

const uploadCategories: UploadCategory[] = ['Lab Results', 'Imaging', 'Prescriptions', 'Others'];

const getCategoryTheme = (category: string) => {
  switch (category) {
    case 'Lab Results':
      return { text: 'text-primary-blue', bg: 'bg-blue-50', dot: 'bg-primary-blue' };
    case 'Imaging':
      return { text: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' };
    case 'Prescriptions':
      return { text: 'text-indigo-600', bg: 'bg-indigo-50', dot: 'bg-indigo-500' };
    default:
      return { text: 'text-slate-500', bg: 'bg-slate-100', dot: 'bg-slate-400' };
  }
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return ImageIcon;
  if (type === 'application/pdf') return FileText;
  return File;
};

export default function MyUploadsPage() {
  const [uploads, setUploads] = useState<UploadedFile[]>(mockUploads);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Upload flow state
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<UploadCategory>('Lab Results');
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const validateAndStage = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only PDF, Word, JPEG, PNG, or WebP files are allowed');
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('File must be smaller than 10MB');
      return;
    }
    setPendingFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndStage(file);
    // reset so same file can be re-selected after cancel
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndStage(file);
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile) return;
    setIsUploading(true);

    try {
      // TODO: replace with real API call to POST /api/upload/document
      await new Promise((res) => setTimeout(res, 1500));

      const newUpload: UploadedFile = {
        id: Date.now().toString(),
        name: pendingFile.name,
        category: selectedCategory,
        size: pendingFile.size > 1024 * 1024
          ? `${(pendingFile.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(pendingFile.size / 1024)} KB`,
        uploadedAt: new Date().toISOString().split('T')[0],
        type: pendingFile.type,
        status: 'uploaded',
      };

      setUploads((prev) => [newUpload, ...prev]);
      setPendingFile(null);
      toast.success(`${pendingFile.name} uploaded successfully!`);
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
    toast.success('File removed');
  };

  const filtered = uploads.filter((u) => {
    const matchesCategory = activeCategory === 'all' || u.category === activeCategory;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-page-fade">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-medium text-black tracking-tight">My Uploads</h2>
          <p className="text-sm text-primary-gray mt-1 font-semibold">
            Manage and upload your personal medical documents
          </p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary bg-primary-blue hover:bg-[#003be6] text-white flex items-center gap-2 shadow-sm border-0 w-full sm:w-auto"
        >
          <Upload className="h-4 w-4" />
          Upload File
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
        onChange={handleFileInput}
      />

      {/* Drop Zone / Confirm Panel */}
      {pendingFile ? (
        /* Confirm Upload Card */
        <Card className="p-6 border-2 border-primary-blue/30 bg-blue-50/40">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
              {(() => {
                const Icon = getFileIcon(pendingFile.type);
                return <Icon className="h-6 w-6 text-primary-blue" />;
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{pendingFile.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {pendingFile.size > 1024 * 1024
                  ? `${(pendingFile.size / (1024 * 1024)).toFixed(1)} MB`
                  : `${Math.round(pendingFile.size / 1024)} KB`}
              </p>

              {/* Category selector */}
              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Select a category for this file
                </label>
                <div className="flex flex-wrap gap-2">
                  {uploadCategories.map((cat) => {
                    const theme = getCategoryTheme(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                          selectedCategory === cat
                            ? `${theme.bg} ${theme.text} border-current`
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-5">
                <Button
                  onClick={handleConfirmUpload}
                  disabled={isUploading}
                  className="bg-primary-blue hover:bg-[#003be6] text-white text-xs px-5 py-2 rounded-xl flex items-center gap-2 font-semibold disabled:opacity-70"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Confirm Upload
                    </>
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => setPendingFile(null)}
                  disabled={isUploading}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        /* Drag & Drop Zone */
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-primary-blue bg-blue-50 scale-[1.01]'
              : 'border-slate-200 bg-white hover:border-primary-blue/50 hover:bg-blue-50/30'
          }`}
        >
          <div className={`p-4 rounded-2xl mb-4 transition-colors ${isDragging ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-blue-100'}`}>
            <CloudUpload className={`h-8 w-8 transition-colors ${isDragging ? 'text-primary-blue' : 'text-slate-400 group-hover:text-primary-blue'}`} />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Drag & drop a file here, or <span className="text-primary-blue">browse</span>
          </p>
          <p className="text-xs text-slate-400 mt-1.5">
            Supported: PDF, Word, JPEG, PNG, WebP · Max 10MB
          </p>
        </div>
      )}

      {/* Files List */}
      <div className="space-y-5">
        {/* Toolbar: search + category filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-black text-base">
            <FolderUp className="h-5 w-5 text-primary-blue" />
            <h3>
              Uploaded Files{' '}
              <span className="text-sm font-normal text-slate-400">
                ({uploads.length})
              </span>
            </h3>
          </div>
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:border-primary-blue focus:ring-1 focus:ring-primary-blue/20 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 select-none">
          {filterCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
                activeCategory === cat.value
                  ? 'bg-primary-blue text-white shadow-sm'
                  : 'bg-slate-100 text-primary-gray hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* File items */}
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((file) => {
              const theme = getCategoryTheme(file.category);
              const FileIcon = getFileIcon(file.type);
              return (
                <Card
                  key={file.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 hover:shadow-sm transition-shadow"
                >
                  <div className="flex gap-4 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <FileIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {file.size} · Uploaded {file.uploadedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 w-full sm:w-auto border-t sm:border-0 border-slate-50 pt-4 sm:pt-0 shrink-0">
                    <span className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider ${theme.text}`}>
                      <span className={`h-2 w-2 rounded-full ${theme.dot}`} />
                      {file.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="p-2 rounded-lg text-slate-400 hover:text-primary-blue hover:bg-blue-50 transition-colors"
                        aria-label="View file"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(file.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-primary-red hover:bg-red-50 transition-colors"
                        aria-label="Delete file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 bg-slate-100 text-slate-300 rounded-2xl flex items-center justify-center mb-5">
                <FolderUp className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-primary-deepblue">No files found</h3>
              <p className="text-sm text-primary-gray mt-1.5 max-w-xs font-medium">
                {searchQuery || activeCategory !== 'all'
                  ? 'Try adjusting your search or category filter.'
                  : 'Upload your first medical document to get started.'}
              </p>
              {!searchQuery && activeCategory === 'all' && (
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-5 bg-primary-blue hover:bg-[#003be6] text-white text-xs px-5 py-2 rounded-xl flex items-center gap-2 font-semibold border-0"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload First File
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
