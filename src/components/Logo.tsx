import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image 
        src="/logo.png" 
        alt="Hackedcv.ai Logo" 
        width={40} 
        height={40}
        className="object-contain w-10 h-10 md:w-12 md:h-12"
      />
      <span className="text-white font-bold text-2xl">Hackedcv.ai</span>
    </div>
  );
}