'use client';

import { useState, useEffect } from 'react';
import { Icon } from '../ui/Icon';

interface Document {
  id: string;
  type: string;
  title: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  expiresAt?: string;
  uploadedAt: string;
}

export default function DocumentsTab({ isDark }: { isDark: boolean }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    type: 'business_permit',
    title: '',
    expiresAt: '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/documents');
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadForm((prev) => ({ ...prev, file }));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title) {
      setUploadError('File and title are required');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('type', uploadForm.type);
      formData.append('title', uploadForm.title);
      if (uploadForm.expiresAt) {
        formData.append('expiresAt', uploadForm.expiresAt);
      }

      const res = await fetch('/api/admin/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      await fetchDocuments();
      setUploadForm({ file: null, type: 'business_permit', title: '', expiresAt: '' });
    } catch (error: any) {
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`/api/admin/documents?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  const filteredDocuments =
    selectedType === 'all' ? documents : documents.filter((d) => d.type === selectedType);

  const typeLabels: Record<string, string> = {
    business_permit: '📋 Business Permit',
    contract_template: '📄 Contract Template',
    certification: '✅ Certification',
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          {/* @ts-ignore */}
          <Icon icon="ph:file-bold" width={24} height={24} className="text-primary-500" />
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            Documents Management
          </h3>
        </div>
        <p className={`text-sm mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
          Manage business permits, contracts, and certifications
        </p>
      </div>

      {/* Upload Form */}
      <div className={`rounded-lg p-6 ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
        <h4 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
          Upload New Document
        </h4>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Document Type
              </label>
              <select
                value={uploadForm.type}
                onChange={(e) => setUploadForm((prev) => ({ ...prev, type: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-neutral-700 border-neutral-600 text-white'
                    : 'bg-white border-neutral-300 text-neutral-900'
                }`}
              >
                <option value="business_permit">Business Permit</option>
                <option value="contract_template">Contract Template</option>
                <option value="certification">Certification</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Title
              </label>
              <input
                type="text"
                value={uploadForm.title}
                onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Business Permit 2026"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-500'
                    : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                File
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-neutral-700 border-neutral-600 text-white file:text-white'
                    : 'bg-white border-neutral-300 text-neutral-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={uploadForm.expiresAt}
                onChange={(e) => setUploadForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-neutral-700 border-neutral-600 text-white'
                    : 'bg-white border-neutral-300 text-neutral-900'
                }`}
              />
            </div>
          </div>

          {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}

          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-2 rounded-lg font-bold transition-colors ${
              uploading
                ? isDark
                  ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                  : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                : isDark
                ? 'bg-primary-600 hover:bg-primary-500 text-white'
                : 'bg-primary-500 hover:bg-primary-600 text-white'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-neutral-200">
        {['all', 'business_permit', 'contract_template', 'certification'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-3 font-medium border-b-2 transition-colors capitalize ${
              selectedType === type
                ? 'border-primary-500 text-primary-600'
                : isDark
                ? 'border-transparent text-neutral-400 hover:text-neutral-300'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {type === 'all' ? 'All Documents' : typeLabels[type] || type}
          </button>
        ))}
      </div>

      {/* Documents List */}
      {loading ? (
        <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Loading documents...</p>
      ) : filteredDocuments.length === 0 ? (
        <div className={`text-center py-8 rounded-lg ${isDark ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
          <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>
            No documents found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className={`rounded-lg p-4 flex items-center justify-between ${
                isDark ? 'bg-neutral-800' : 'bg-neutral-50'
              }`}
            >
              <div className="flex-1">
                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  {doc.title}
                </h4>
                <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  {doc.fileName} • {formatFileSize(doc.fileSize)}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                  Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                  {doc.expiresAt && ` • Expires: ${new Date(doc.expiresAt).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={doc.filePath}
                  download
                  className={`px-3 py-2 rounded-lg font-bold text-xs transition-colors ${
                    isDark
                      ? 'bg-primary-600 hover:bg-primary-500 text-white'
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                  }`}
                >
                  {/* @ts-ignore */}
                  <Icon icon="ph:download-simple-bold" width={16} height={16} className="inline mr-1" />
                  Download
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className={`px-3 py-2 rounded-lg font-bold text-xs transition-colors ${
                    isDark
                      ? 'bg-red-900 hover:bg-red-800 text-red-200'
                      : 'bg-red-100 hover:bg-red-200 text-red-700'
                  }`}
                >
                  {/* @ts-ignore */}
                  <Icon icon="ph:trash-simple-bold" width={16} height={16} className="inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
