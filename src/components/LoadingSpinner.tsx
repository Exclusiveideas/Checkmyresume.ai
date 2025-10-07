import { LoadingSpinnerProps } from "@/types";
import { cn } from "@/lib/utils";

export default function LoadingSpinner({
  size = "md",
  color = "text-blue-600",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-200 border-t-current",
          sizeClasses[size],
          color,
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
  elapsedSeconds?: number;
}

export function LoadingState({
  message = "Loading...",
  elapsedSeconds = 0,
}: LoadingStateProps) {
  const totalSeconds = 120;
  const progress = Math.min((elapsedSeconds / totalSeconds) * 100, 100);
  const remainingSeconds = Math.max(totalSeconds - elapsedSeconds, 0);
  const remainingMinutes = Math.floor(remainingSeconds / 60);
  const remainingSecondsDisplay = remainingSeconds % 60;

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8">
      <div className="relative">
        <LoadingSpinner size="lg" />
        <div className="absolute inset-0 animate-ping">
          <LoadingSpinner size="lg" color="text-purple-400" />
        </div>
      </div>
      <div className="text-center space-y-4 w-full max-w-md">
        <p className="text-lg font-medium text-gray-200 animate-pulse">
          {message}
        </p>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{Math.round(progress)}% complete</span>
            {remainingSeconds > 0 && (
              <span>
                ~{remainingMinutes > 0 ? `${remainingMinutes}m ` : ""}
                {remainingSecondsDisplay}s remaining
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-400">Analysis takes up to 2 minutes</p>
      </div>
    </div>
  );
}
