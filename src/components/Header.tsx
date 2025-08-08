import { HeaderProps } from '@/types';
import { cn } from '@/lib/utils';

export default function Header({ title, subtitle, className, children }: HeaderProps) {
  return (
    <header className={cn("text-center space-y-4", className)}>
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </header>
  );
}