import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { FileValidation, FileType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateFile(file: File, maxSize: number = 5 * 1024 * 1024): FileValidation {
  const errors: string[] = [];
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
  const allowedExtensions = ['.pdf', '.docx', '.doc'];
  
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
  
  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
    errors.push('File must be PDF, DOC, or DOCX format');
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }
  
  if (file.size === 0) {
    errors.push('File cannot be empty');
  }

  let fileType: FileType | undefined;
  if (file.type === 'application/pdf' || fileExtension === '.pdf') {
    fileType = 'pdf';
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileExtension === '.docx') {
    fileType = 'docx';
  } else if (file.type === 'application/msword' || fileExtension === '.doc') {
    fileType = 'doc';
  }

  return {
    isValid: errors.length === 0,
    errors,
    fileType,
    fileSize: file.size,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(fileType: FileType): string {
  switch (fileType) {
    case 'pdf':
      return '📄';
    case 'docx':
    case 'doc':
      return '📝';
    default:
      return '📋';
  }
}


export function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      let text = '';
      
      for (let i = 0; i < uint8Array.length; i++) {
        if (uint8Array[i] >= 32 && uint8Array[i] <= 126) {
          text += String.fromCharCode(uint8Array[i]);
        }
      }
      
      if (text.length < 100) {
        reject(new Error('Unable to extract text from PDF. Please ensure the PDF contains selectable text.'));
      } else {
        resolve(text);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export function generateErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}