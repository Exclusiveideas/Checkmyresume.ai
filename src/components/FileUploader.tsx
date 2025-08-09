'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, File, X, Check } from 'lucide-react';
import { FileUploaderProps } from '@/types';
import { cn, validateFile, formatFileSize, getFileIcon } from '@/lib/utils';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from '@/hooks/useToast';

export default function FileUploader({
  onFileSelect,
  onUpload,
  isUploading,
  maxSize,
  className
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const toast = useToast();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setDragActive(false);

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        toast.error(`File is too large. Maximum size is ${formatFileSize(maxSize)}.`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        toast.error('Invalid file type. Please upload a PDF or Word document.');
      } else {
        toast.error('File upload failed. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const validation = validateFile(file, maxSize);
      
      if (!validation.isValid) {
        toast.error(validation.errors.join(', '));
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);
      toast.success(`${file.name} selected successfully!`);
    }
  }, [maxSize, onFileSelect, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxSize,
    multiple: false,
    disabled: isUploading
  });

  const handleRemoveFile = () => {
    setSelectedFile(null);
    toast.info('File removed. You can select another file.');
  };

  const handleUpload = async () => {
    if (selectedFile) {
      try {
        await onUpload(selectedFile);
        setSelectedFile(null);
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
      }
    }
  };

  // Using toasts for error handling now

  return (
    <div className={cn("w-full max-w-lg mx-auto space-y-4", className)}>
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer",
            "hover:bg-gray-50 dark:hover:bg-gray-800/50",
            {
              "border-blue-400 bg-blue-50 dark:bg-blue-900/20": isDragActive || dragActive,
              "border-gray-300 dark:border-gray-600": !isDragActive && !dragActive,
              "cursor-not-allowed opacity-60": isUploading
            }
          )}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Supports PDF, DOC, DOCX • Max {formatFileSize(maxSize)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {getFileIcon(selectedFile.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'docx')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              disabled={isUploading}
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className={cn(
              "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200",
              "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
              "text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
              "focus:outline-none focus:ring-4 focus:ring-blue-500/30",
              "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
            )}
          >
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner size="sm" color="text-white" />
                <span>Analyzing Resume...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Analyze Resume</span>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Error handling is now done via toasts */}

      <div className="text-center">
        <div className="inline-flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Check className="w-3 h-3 text-green-500" />
            <span>Secure Upload</span>
          </div>
          <div className="flex items-center space-x-1">
            <Check className="w-3 h-3 text-green-500" />
            <span>AI Powered</span>
          </div>
          <div className="flex items-center space-x-1">
            <Check className="w-3 h-3 text-green-500" />
            <span>Instant Results</span>
          </div>
        </div>
      </div>
    </div>
  );
}