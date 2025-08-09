'use client';

import LiquidGlass from '@/components/LiquidGlass';
import { useToast } from '@/hooks/useToast';
import { isValidEmail, validateFile } from '@/lib/utils';
import { FileUp } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import './minimalForm.css';

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
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Main Form Container */}
      <div className="input-container" style={{ position: 'relative' }}>
        <LiquidGlass
          className="dock-glass"
          padding="0rem"
          borderRadius="0"
          hoverPadding="0"
          hoverBorderRadius="0"
          noTint={true}
        >
          <input
            type="email"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="email-input"
            disabled={isUploading}
          />
          <button
            onClick={handleUploadClick}
            className="upload-button"
            disabled={isUploading}
          >
            <FileUp className="w-5 h-5" />
            <span>Upload resume</span>
          </button></LiquidGlass>

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
      <div className="text-center max-w-max mx-auto">
        <LiquidGlass
          className="dock-glass"
          padding="0rem"
          borderRadius="2.5rem"
          hoverPadding="0.2rem"
          hoverBorderRadius="2.5rem"
          noTint={false}
        >
          <button
            onClick={handleScan}
            disabled={isUploading || !selectedFile || !email.trim() || !isValidEmail(email)}
            className="scan-button"
          >
            {isUploading ? 'Scanning...' : 'Scan'}
          </button>
        </LiquidGlass>
      </div>
    </div>
  );
}