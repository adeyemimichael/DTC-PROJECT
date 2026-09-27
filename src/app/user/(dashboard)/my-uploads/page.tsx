'use client';

import { useState, useRef, useEffect } from 'react';
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
  Video,
  Music,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useFileUpload } from '@/hooks';

type UploadCategory = 'Lab Results' | 'General';
type ApiCategory = 'lab_result_scan' | 'general';

interface DisplayFile {
  id: string;
  patient_id: string;
  file_type: string;
  category: ApiCategory;
  storage_path: string;
  description: string | null;
  created_at: string;
  signedUrl?: string;
  displayCategory: UploadCategory;
  displayName: string;
  displaySize: string;
  displayDate: string;
}

const filterCategories = [
  { label: 'All Files', value: 'all' },
  { label: 'Lab Results', value: 'lab_result_scan' },
  { label: 'General', value: 'general' },
];

const uploadCategories: { label: UploadCategory; value: ApiCategory }[] = [
  { label: 'Lab Results', value: 'lab_result_scan' },
  { label: 'General', value: 'general' },
];

const mapApiCategoryToDisplay = (apiCat: ApiCategory): UploadCategory => {
  return apiCat === 'lab_result_scan' ? 'Lab Results' : 'General';
};

const getCategoryTheme = (category: ApiCategory | string) => {
  switch (category) {
    case 'lab_result_scan':
    case 'Lab Results':
      return { text: 'text-primary-blue', bg: 'bg-blue-50', dot: 'bg-primary-blue' };
    case 'general':
    case 'General':
      return { text: 'text-slate-500', bg: 'bg-slate-100', dot: 'bg-slate-400' };
    default:
      return { text: 'text-slate-500', bg: 'bg-slate-100', dot: 'bg-slate-400' };
  }
};

const getFileIcon = (fileType: string) => {
  if (fileType === 'image') return ImageIcon;
  if (fileType === 'document') return FileText;
  if (fileType === 'video') return Video;
  if (fileType === 'audio') return Music;
  return File;
};

export default function MyUploadsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Upload flow state
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ApiCategory>('lab_result_scan');


  const { 
    uploads, 
    uploadDocument, 
    fetchUploads, 
    removeUpload,
    isUploading, 
    isFetching 
  } = useFileUpload();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'audio/mpeg',
    'audio/mp4',
    'audio/wav',
    'video/mp4',
    'video/quicktime',
    'application/pdf',
  ];
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB

  // Fetch existing uploads on mount
  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  const validateAndStage = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only PDF, images (JPEG, PNG), audio (MP3, WAV), and video (MP4, MOV) files are allowed');
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('File must be smaller than 50MB');
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

    const result = await uploadDocument({
      file: pendingFile,
      description: description.trim() || undefined,
      category: selectedCategory,
    });

    if (result.success) {
      // Hook already added to uploads list
      setPendingFile(null);
      setDescription('');
      setSelectedCategory('lab_result_scan');
    }
  };

  const handleDelete = async (id: string) => {
    // TODO: Implement delete API endpoint
    removeUpload(id);
    toast.success('File removed');
  };

  // Transform uploads for display
  const displayUploads: DisplayFile[] = uploads.map((file) => {
    const fileName = file.storage_path.split('/').pop() || 'unknown';
    const category = file.category as ApiCategory;
    
    return {
      ...file,
      category,
      displayCategory: mapApiCategoryToDisplay(category),
      displayName: file.description || fileName,
      displaySize: 'N/A',
      displayDate: new Date(file.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };
  });

  const filtered = displayUploads.filter((u) => {
    const matchesCategory = activeCategory === 'all' || u.category === activeCategory;
    const matchesSearch = u.displayName.toLowerCase().includes(searchQuery.toLowerCase());
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
        accept=".pdf,.jpg,.jpeg,.png,.mp3,.mp4,.wav,.mov"
        onChange={handleFileInput}
      />

      {/* Drop Zone / Confirm Panel */}
      {pendingFile ? (
        /* Confirm Upload Card */
        <Card className="p-6 border-2 border-primary-blue/30 bg-blue-50/40">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
              <CloudUpload className="h-6 w-6 text-primary-blue" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{pendingFile.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {pendingFile.size > 1024 * 1024
                  ? `${(pendingFile.size / (1024 * 1024)).toFixed(1)} MB`
                  : `${Math.round(pendingFile.size / 1024)} KB`}
              </p>

              {/* Description input */}
              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Blood test results from January 2026"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-primary-blue focus:ring-1 focus:ring-primary-blue/20 focus:outline-none"
                />
              </div>

              {/* Category selector */}
              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Select a category for this file
                </label>
                <div className="flex flex-wrap gap-2">
                  {uploadCategories.map((cat) => {
                    const theme = getCategoryTheme(cat.value);
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                          selectedCategory === cat.value
                            ? `${theme.bg} ${theme.text} border-current`
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {cat.label}
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
                  onClick={() => {
                    setPendingFile(null);
                    setDescription('');
                  }}
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
            Supported: PDF, images, audio, video · Max 50MB
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
              {isFetching ? (
                <Loader2 className="inline h-4 w-4 animate-spin text-slate-400" />
              ) : (
                <span className="text-sm font-normal text-slate-400">
                  ({uploads.length})
                </span>
              )}
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
        {isFetching ? (
          <Card className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary-blue mb-3" />
            <p className="text-sm text-slate-500">Loading your uploads...</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.length > 0 ? (
              filtered.map((file) => {
                const theme = getCategoryTheme(file.category);
                const FileIcon = getFileIcon(file.file_type);
                return (
                  <Card
                    key={file.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex gap-4 min-w-0 flex-1">
                      <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        <FileIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">{file.displayName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {file.displaySize} · Uploaded {file.displayDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 w-full sm:w-auto border-t sm:border-0 border-slate-50 pt-4 sm:pt-0 shrink-0">
                      <span className={`flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider ${theme.text}`}>
                        <span className={`h-2 w-2 rounded-full ${theme.dot}`} />
                        {file.displayCategory}
                      </span>
                      <div className="flex items-center gap-2">
                        {file.signedUrl && (
                          <a
                            href={file.signedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-slate-400 hover:text-primary-blue hover:bg-blue-50 transition-colors"
                            aria-label="View file"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                        )}
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
        )}
      </div>
    </div>
  );
}
