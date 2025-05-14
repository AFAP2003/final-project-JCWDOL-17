import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';

export default function NavbarSkeleton() {
  return (
    <nav className="relative z-50 bg-neutral-50">
      <div className="h-[220px] fixed top-0 left-0 w-full bg-neutral-50">
        <div
          className={cn(
            'w-full flex flex-col justify-center items-center text-neutral-500 font-medium transition-all duration-500 font-bitter py-3',
          )}
        >
          <div className="w-full flex justify-center items-center gap-3">
            <p className="italic relative hidden lg:block">
              Fresh grocery store
            </p>
            <div className="relative w-56 h-[88px] cursor-pointer mb-6">
              <Skeleton className="absolute inset-0" />
            </div>
            <p className="italic hidden lg:block">from Indonesia</p>
          </div>

          <Separator className="bg-neutral-500 h-1 rounded-full" />
        </div>

        <div className="h-[80px] w-full py-1.5 px-6">
          <div className="flex w-full h-full justify-between items-center gap-x-3">
            <div className="max-lg:hidden">
              <Skeleton className="w-[120px] h-[32px]" />
            </div>

            <div className="flex items-center justify-center gap-3 grow max-lg:hidden">
              <Skeleton className="max-w-md w-full h-[32px]" />
              <Skeleton className="w-[32px] h-[32px]" />
              <Skeleton className="w-[32px] h-[32px]" />
            </div>

            <div className="hidden max-lg:block w-full">
              <Skeleton className="h-[32px] w-full" />
            </div>

            <div className="flex gap-3">
              <Skeleton className="w-[60px] h-[32px]" />
              <Skeleton className="w-[60px] h-[32px]" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
