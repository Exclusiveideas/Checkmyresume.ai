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

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8">
      <div className="relative">
        <LoadingSpinner size="lg" />
        <div className="absolute inset-0 animate-ping">
          <LoadingSpinner size="lg" color="text-purple-400" />
        </div>
      </div>
    </div>
  );
}