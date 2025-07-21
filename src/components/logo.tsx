import { LockKeyhole } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LockKeyhole className="h-7 w-7 text-primary" />
      <h1 className="text-2xl font-bold text-primary font-headline">VoiceKey</h1>
    </div>
  );
}
