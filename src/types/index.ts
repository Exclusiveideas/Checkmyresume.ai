export interface ResumeAnalysis {
  skillsAnalysis: {
    technicalSkills: string[];
    softSkills: string[];
    skillsGaps: string[];
    overallScore: number;
  };
  experienceAnalysis: {
    yearsOfExperience: number;
    careerLevel: 'Entry' | 'Mid' | 'Senior' | 'Executive';
    industryFit: string;
    keyAchievements: string[];
  };
  atsScore: {
    score: number;
    maxScore: number;
    improvements: string[];
    keywordMatches: number;
  };
  recommendations: {
    strengths: string[];
    weaknesses: string[];
    improvementSuggestions: string[];
    nextSteps: string[];
  };
  formatting: {
    readability: number;
    structure: number;
    consistency: number;
    professionalAppearance: number;
  };
  contactInfo: {
    hasEmail: boolean;
    hasPhone: boolean;
    hasLinkedIn: boolean;
    hasPortfolio: boolean;
  };
}

export interface ApiResponse {
  success: boolean;
  data?: ResumeAnalysis;
  error?: string;
  message?: string;
}

export interface FileUploadState {
  file: File | null;
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface UploadResponse {
  success: boolean;
  analysis?: ResumeAnalysis;
  error?: string;
  validationErrors?: ValidationError[];
}

export type FileType = 'pdf' | 'docx' | 'doc';

export interface FileValidation {
  isValid: boolean;
  errors: string[];
  fileType?: FileType;
  fileSize?: number;
}

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingSpinnerProps extends ComponentProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export interface FileUploaderProps extends ComponentProps {
  onFileSelect: (file: File) => void;
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  error: string | null;
  acceptedTypes: string[];
  maxSize: number;
}

export interface ResultsDisplayProps extends ComponentProps {
  analysis: ResumeAnalysis;
  onReset: () => void;
  onDownload: (format: 'json' | 'pdf') => void;
}

export interface HeaderProps extends ComponentProps {
  title: string;
  subtitle?: string;
}