import { LoadingSpinnerProps } from '@/types';
import { cn } from '@/lib/utils';
import { useProgressSimulation } from '@/hooks/useProgressSimulation';

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

export function LoadingState({ message: fallbackMessage = "Analyzing your resume..." }: { message?: string }) {
  const { progress, message, isComplete } = useProgressSimulation();

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8">
      <div className="relative">
        <LoadingSpinner size="lg" />
        <div className="absolute inset-0 animate-ping">
          <LoadingSpinner size="lg" color="text-purple-400" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {message}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isComplete ? "Almost done..." : "This may take a few seconds..."}
        </p>
      </div>
      <div className="w-64 bg-gray-200 rounded-full h-2 dark:bg-gray-700 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
        {progress}%
      </div>
    </div>
  );
}