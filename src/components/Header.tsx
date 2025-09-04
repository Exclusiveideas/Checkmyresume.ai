import { cn } from '@/lib/utils';
import { HeaderProps } from '@/types';

export default function Header({ title, className, children }: HeaderProps) {
  return (
    <header className={cn("text-center mb-8", className)}>
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
        {title}
      </h1>
      {children}
    </header>
  );
}