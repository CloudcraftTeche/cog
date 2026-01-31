// components/chapters/SubmissionForm.tsx
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Video, File, XCircle } from 'lucide-react';
import type { SubmissionType } from '@/types/student/chapter.types';
import { validateSubmissionFile, formatFileSize } from '@/utils/student/chapterUtils';

interface SubmissionFormProps {
  submissionType: SubmissionType;
  textContent: string;
  selectedFile: File | null;
  loading: boolean;
  onTypeChange: (type: SubmissionType) => void;
  onTextChange: (text: string) => void;
  onFileSelect: (file: File | null) => void;
  onError: (error: string | null) => void;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({
  submissionType,
  textContent,
  selectedFile,
  loading,
  onTypeChange,
  onTextChange,
  onFileSelect,
  onError,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateSubmissionFile(file, submissionType);
    if (validationError) {
      onError(validationError);
      onFileSelect(null);
      setPreviewUrl(null);
      return;
    }

    onFileSelect(file);
    onError(null);

    if (submissionType === 'video') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else if (submissionType === 'pdf') {
      setPreviewUrl(file.name);
    }
  };

  const handleTypeChange = (type: SubmissionType) => {
    if (previewUrl && submissionType === 'video') {
      URL.revokeObjectURL(previewUrl);
    }
    onTypeChange(type);
    onFileSelect(null);
    setPreviewUrl(null);
    onTextChange('');
    onError(null);
  };

  const handleRemoveFile = () => {
    if (previewUrl && submissionType === 'video') {
      URL.revokeObjectURL(previewUrl);
    }
    onFileSelect(null);
    setPreviewUrl(null);
  };

  useEffect(() => {
    return () => {
      if (previewUrl && submissionType === 'video') {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, submissionType]);

  return (
    <div className="space-y-6 border-t pt-6">
      <h3 className="text-lg font-semibold text-gray-800">Your Submission</h3>

      <div className="space-y-3">
        <label className="text-sm font-medium">Submission Type</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleTypeChange('text')}
            disabled={loading}
            className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              submissionType === 'text'
                ? 'border-purple-600 bg-purple-50 text-purple-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <FileText className="h-6 w-6" />
            <span className="text-sm font-medium">Text</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('video')}
            disabled={loading}
            className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              submissionType === 'video'
                ? 'border-purple-600 bg-purple-50 text-purple-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Video className="h-6 w-6" />
            <span className="text-sm font-medium">Video</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('pdf')}
            disabled={loading}
            className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              submissionType === 'pdf'
                ? 'border-purple-600 bg-purple-50 text-purple-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <File className="h-6 w-6" />
            <span className="text-sm font-medium">PDF</span>
          </button>
        </div>
      </div>

      {submissionType === 'text' && (
        <div className="space-y-2">
          <label htmlFor="textContent" className="text-sm font-medium">
            Your Response
          </label>
          <Textarea
            id="textContent"
            value={textContent}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Write your response here... (minimum 10 characters)"
            rows={8}
            className="w-full"
            disabled={loading}
          />
          <p className="text-xs text-gray-500">
            {textContent.length} / 10 characters minimum
          </p>
        </div>
      )}

      {(submissionType === 'video' || submissionType === 'pdf') && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
            <input
              type="file"
              id="fileInput"
              accept={
                submissionType === 'video' ? 'video/*' : 'application/pdf'
              }
              onChange={handleFileSelect}
              disabled={loading}
              className="hidden"
            />
            <label
              htmlFor="fileInput"
              className={`cursor-pointer flex flex-col items-center gap-3 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Click to upload {submissionType}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {submissionType === 'video'
                    ? 'MP4, MPEG, MOV, WebM, AVI (Max 25MB)'
                    : 'PDF only (Max 25MB)'}
                </p>
              </div>
            </label>
          </div>

          {selectedFile && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                {submissionType === 'video' ? (
                  <Video className="h-5 w-5 text-purple-600 mt-0.5" />
                ) : (
                  <File className="h-5 w-5 text-purple-600 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              {submissionType === 'video' && previewUrl && (
                <video
                  src={previewUrl}
                  controls
                  className="w-full mt-4 rounded-lg"
                  style={{ maxHeight: '300px' }}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};