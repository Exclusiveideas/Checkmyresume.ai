'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import FileUploader from '@/components/FileUploader';
import ResultsDisplay from '@/components/ResultsDisplay';
import { LoadingState } from '@/components/LoadingSpinner';
import { ResumeAnalysisData, ApiResponse } from '@/types';
import { useToast } from '@/hooks/useToast';

export default function Home() {
  const [, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysisData | null>(null);
  const toast = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    toast.dismiss(); // Clear any previous toasts
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    toast.dismiss(); // Clear any previous toasts
    
    // Show loading toast
    const loadingToastId = toast.loading('Analyzing your resume with AI...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/scan-resume', {
        method: 'POST',
        body: formData,
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (result.success && result.data) {
        // Dismiss loading toast and show success
        toast.dismiss(loadingToastId);
        toast.success('Resume analysis completed successfully! 🎉');
        
        setAnalysis(result.data);
        setSelectedFile(null);
      } else {
        throw new Error(result.error || 'Failed to analyze resume');
      }
    } catch (err) {
      console.error('Upload error:', err);
      
      // Dismiss loading toast and show error
      toast.dismiss(loadingToastId);
      
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      // Show different error types with appropriate styling
      if (errorMessage.includes('configuration') || errorMessage.includes('API key') || errorMessage.includes('Assistant')) {
        toast.error(errorMessage, { duration: 8000 });
        toast.info('💡 Tip: Check the README for setup instructions', { duration: 6000 });
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        toast.error(errorMessage, { duration: 6000 });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setSelectedFile(null);
    setIsUploading(false);
    toast.dismiss(); // Clear any toasts when resetting
    toast.info('Ready to analyze another resume!');
  };

  const handleDownload = (format: 'json' | 'pdf') => {
    if (format === 'json' && analysis) {
      const dataStr = JSON.stringify(analysis, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'resume-analysis.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Analysis downloaded successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="space-y-12">
          {/* Header Section */}
          <Header
            title="Resume Scanner AI"
            subtitle="Upload your resume and get AI-powered insights to improve your job prospects. Our advanced analysis provides detailed feedback on skills, ATS optimization, and professional presentation."
            className="mb-16"
          />

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            {isUploading ? (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
                <LoadingState message="Analyzing your resume with AI..." />
              </div>
            ) : analysis ? (
              <ResultsDisplay
                analysis={analysis}
                onReset={handleReset}
                onDownload={handleDownload}
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Ready to Optimize Your Resume?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Our AI will analyze your resume for skills, experience, ATS compatibility, and professional formatting. 
                    Get actionable insights to stand out to employers.
                  </p>
                </div>

                <FileUploader
                  onFileSelect={handleFileSelect}
                  onUpload={handleUpload}
                  isUploading={isUploading}
                  error={null} // Using toasts for errors now
                  acceptedTypes={['.pdf', '.doc', '.docx']}
                  maxSize={5 * 1024 * 1024} // 5MB
                />

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">ATS Optimization</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ensure your resume passes applicant tracking systems</p>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto">
                      <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Skills Analysis</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Identify skill gaps and strengths in your profile</p>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Actionable Insights</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get specific recommendations for improvement</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="text-center text-sm text-gray-500 dark:text-gray-400 pt-8">
            <div className="space-y-2">
              <p>Powered by OpenAI • Secure & Private • No data stored</p>
              <p className="text-xs">Your resume is analyzed in real-time and not saved on our servers</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
