'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCart } from '@/context/cart-provider';
import { useSession } from '@/lib/auth/client';
import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import LoginDialog from '../login-dialog';

interface Props {
  className?: string;
}

export function CartButton({ className }: Props) {
  const { totalItems } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const isLogin = session?.user && session.user.role === 'USER';

  const [loginDialog, setLoginDialog] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={() => {
                if (!isLogin) {
                  setLoginDialog(true);
                } else {
                  router.push('/cart');
                }
              }}
              className={cn(
                'group flex items-center justify-center relative cursor-pointer',
                className,
              )}
            >
              {/* If children exist, render them */}
              <div className="flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  {/* Subtle background effect on hover */}
                  <div className="absolute inset-0 rounded-full opacity-0 bg-neutral-200 transition-opacity duration-200 group-hover:opacity-20" />

                  {/* Icon container */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors duration-200 group-hover:text-neutral-900-neutral-100">
                    {/* Status indicator */}
                    {isLogin && (
                      <div
                        className={cn(
                          'absolute -right-4 -top-1.5 px-[6px] py-[2px] rounded-full border border-white text-[10px] font-mono bg-red-500 text-white',
                        )}
                      >
                        {totalItems}
                      </div>
                    )}
                    {/* Bag icon - using the same size as Map */}
                    <ShoppingBag className="size-6" />
                  </div>
                </div>

                {/* Label */}
                <div className="text-xs font-medium text-neutral-600 transition-colors duration-200 group-hover:text-neutral-900-neutral-200">
                  Keranjang
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="bg-white border-neutral-200 text-neutral-800 shadow-md"
          >
            <div className="flex items-center gap-1.5 bg-neutral-100">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <span>{`Total (${totalItems}) item`}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <LoginDialog
        open={loginDialog}
        onOpenChange={setLoginDialog}
        onCancel={() => setLoginDialog(false)}
      />
    </>
  );
}
