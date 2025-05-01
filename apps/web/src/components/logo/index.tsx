import { cn } from '@/lib/utils';
import Link from 'next/link';

interface LogoProps {
  href?: string;
  size?: string;
  fontSize?: string;
  showText?: boolean;
  className?: string;
}

export default function Logo({
  href = '/',
  size = '40px',
  fontSize = '24px',
  showText = true,
  className,
}: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Link
        href={href}
        className="group flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/90 to-primary transition-all duration-300 hover:shadow-lg hover:from-primary hover:to-primary/90"
        style={{ width: size, height: size }}
      >
        <span
          className="font-bold text-primary-foreground transition-transform duration-300 group-hover:scale-110"
          style={{ fontSize }}
        >
          A
        </span>
      </Link>
      {showText && (
        <span
          className="bg-gradient-to-r from-primary to-primary bg-clip-text font-bold text-transparent transition-colors text-neutral-200"
          style={{ fontSize: `calc(${fontSize} * 1.1)` }}
        >
          App
        </span>
      )}
    </div>
  );
}
