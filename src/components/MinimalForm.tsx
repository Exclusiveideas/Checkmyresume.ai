'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { validateFile, isValidEmail } from '@/lib/utils';

interface MinimalFormProps {
  onFileSelect: (file: File, email: string) => void;
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  maxSize: number;
}

export default function MinimalForm({ onFileSelect, onUpload, isUploading, maxSize }: MinimalFormProps) {
  const [email, setEmail] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Notify parent when email changes if we have a file and valid email
  useEffect(() => {
    if (selectedFile && email.trim() && isValidEmail(email)) {
      onFileSelect(selectedFile, email);
    }
  }, [email, selectedFile, onFileSelect]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateFile(file, maxSize);
      
      if (!validation.isValid) {
        toast.error(validation.errors.join(', '));
        return;
      }

      setSelectedFile(file);
      toast.success(`${file.name} selected successfully!`);
      
      // Only notify parent if we have valid email, otherwise wait for scan
      if (email.trim() && isValidEmail(email)) {
        onFileSelect(file, email);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleScan = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a resume file first');
      return;
    }

    // Notify parent with both file and email before uploading
    onFileSelect(selectedFile, email);

    try {
      await onUpload(selectedFile);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Input Row */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="email"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="minimal-input w-full"
            disabled={isUploading}
          />
        </div>
        
        <button
          onClick={handleUploadClick}
          className="minimal-button flex items-center space-x-2"
          disabled={isUploading}
        >
          <Upload className="w-5 h-5" />
          <span>Upload resume</span>
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx"
          className="hidden"
        />
      </div>

      {/* Selected File Indicator */}
      {selectedFile && (
        <div className="text-center">
          <p className="text-white/70 text-sm">
            Selected: <span className="text-white font-medium">{selectedFile.name}</span>
          </p>
        </div>
      )}

      {/* Scan Button */}
      <div className="text-center">
        <button
          onClick={handleScan}
          disabled={isUploading || !selectedFile || !email.trim() || !isValidEmail(email)}
          className="scan-button"
        >
          {isUploading ? 'Scanning...' : 'Scan'}
        </button>
      </div>
    </div>
  );
}