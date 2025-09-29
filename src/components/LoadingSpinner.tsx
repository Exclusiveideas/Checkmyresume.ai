import { LoadingSpinnerProps } from '@/types';
import { cn } from '@/lib/utils';

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'text-blue-600', 
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-200 border-t-current",
          sizeClasses[size],
          color
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8">
      <div className="relative">
        <LoadingSpinner size="lg" />
        <div className="absolute inset-0 animate-ping">
          <LoadingSpinner size="lg" color="text-purple-400" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-gray-200 animate-pulse">
          {message}
        </p>
        <p className="text-sm text-gray-400">
          This may take up to 2 minutes
        </p>
      </div>
    </div>
  );
}