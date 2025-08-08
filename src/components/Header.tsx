import { HeaderProps } from '@/types';
import { cn } from '@/lib/utils';

export default function Header({ title, className, children }: HeaderProps) {
  return (
    <header className={cn("text-center", className)}>
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-12">
        {title}
      </h1>
      {children}
    </header>
  );
}