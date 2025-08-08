'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName="toast-container"
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        duration: 5000,
        style: {
          background: 'white',
          color: '#374151',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e5e7eb',
          padding: '16px 20px',
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '400px',
        },
        // Success toast styling
        success: {
          duration: 4000,
          style: {
            background: '#f0fdf4',
            color: '#15803d',
            border: '1px solid #bbf7d0',
          },
          iconTheme: {
            primary: '#22c55e',
            secondary: '#f0fdf4',
          },
        },
        // Error toast styling
        error: {
          duration: 6000,
          style: {
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fef2f2',
          },
        },
        // Loading toast styling
        loading: {
          style: {
            background: '#f8fafc',
            color: '#475569',
            border: '1px solid #e2e8f0',
          },
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#f8fafc',
          },
        },
      }}
    />
  );
}