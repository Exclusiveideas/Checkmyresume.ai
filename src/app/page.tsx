'use client';

import Header from '@/components/Header';
import LiquidGlass from '@/components/LiquidGlass';
import LiquidGlassFilter from '@/components/LiquidGlassFilter';
import { LoadingState } from '@/components/LoadingSpinner';
import MinimalForm from '@/components/MinimalForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import { useToast } from '@/hooks/useToast';
import { ApiResponse, ResumeAnalysisData } from '@/types';
import { useEffect, useState } from 'react';

export default function Home() {
  const [_selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysisData | null>(null);
  const toast = useToast();
  const [particles, setParticles] = useState<Array<{
    id: number;
    left: number;
    animationDelay: number;
    animationDuration: number;
  }>>([]);

  // Initialize particles
  useEffect(() => {
    const particleArray = [];
    for (let i = 0; i < 250; i++) {
      particleArray.push({
        id: i,
        left: Math.random() * 100,
        animationDelay: Math.random() * 10,
        animationDuration: 10 + Math.random() * 10
      });
    }
    setParticles(particleArray);
  }, []);

  const handleFileSelect = (file: File, email: string) => {
    setSelectedFile(file);
    setUserEmail(email);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    toast.dismiss(); // Clear any previous toasts

    // Show loading toast
    const loadingToastId = toast.loading('Analyzing your resume with AI...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('email', userEmail);

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
    setUserEmail('');
    setIsUploading(false);
    toast.dismiss(); // Clear any toasts when resetting
    toast.info('Ready to analyze another resume!');
  };


  return (
    <div className="h-screen dark-grid-bg">
      <LiquidGlassFilter />
      <div className="particles-container">
        {particles?.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`
            }}
          />
        ))}
      </div>
      <div className="container mx-auto px-4 py-8 flex flex-col justify-center min-h-screen">
        {isUploading ? (
          <div className="flex items-center justify-center max-w-max self-center">
            <LiquidGlass
              className="dock-glass"
              padding="0rem"
              borderRadius="2.5rem"
              hoverPadding="0.2rem"
              hoverBorderRadius="2.5rem"
              noTint={false}
            >
              <div className=" rounded-2xl p-8">
                <LoadingState message="Analyzing your resume with AI..." />
              </div>
            </LiquidGlass>
          </div>
        ) : analysis ? (
          <ResultsDisplay
            analysis={analysis}
            onReset={handleReset}
          />
        ) : (
          <div className="text-center space-y-16">
            {/* Header */}
            <Header title="AI Resume Scanner" />

            {/* Minimal Form */}
            <MinimalForm
              onFileSelect={handleFileSelect}
              onUpload={handleUpload}
              isUploading={isUploading}
              maxSize={5 * 1024 * 1024}
            />
          </div>
        )}
      </div>
    </div>
  );
}
