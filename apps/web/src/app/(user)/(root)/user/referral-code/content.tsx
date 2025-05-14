'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/lib/auth/client';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export default function Content() {
  const { data: session, isPending } = useSession();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    if (!session?.user.referralCode) return;

    navigator.clipboard.writeText(session.user.referralCode);
    setCopied(true);

    toast({
      title: 'Kode referral disalin!',
      description: 'Bagikan kode ini ke teman-teman Anda',
    });

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6 h-full">
      <div className="size-full flex flex-col">
        <div className={cn('relative overflow-hidden rounded-xl p-6 h-full')}>
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 via-neutal-50 to-neutral-50 opacity-90" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="">
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                Bagikan & Dapatkan Hadiah
              </h3>

              <p className="text-neutral-700/80 mb-6 text-sm">
                Ajak teman bergabung dan dapatkan{' '}
                <span className="font-bold text-neutral-700">
                  Bonus Teman Baru 10K
                </span>{' '}
                voucher untuk setiap teman yang mendaftar dengan kode referral
                Anda!
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="h-7 w-7 rounded-full bg-neutral-200 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-neutral-700 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="text-neutral-700 font-medium text-sm">
                      Bagikan Kode Referral Anda
                    </h4>
                    <p className="text-neutral-700/70 text-sm">
                      Salin kode di bawah dan bagikan ke teman Anda
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="h-7 w-7 rounded-full bg-neutral-200 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-neutral-700 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-neutral-700 font-medium text-sm">
                      Teman Mendaftar
                    </h4>
                    <p className="text-neutral-700/70 text-sm">
                      Teman Anda mendaftar menggunakan kode referral Anda
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="h-7 w-7 rounded-full bg-neutral-200 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-neutral-700 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="text-neutral-700 font-medium text-sm">
                      Terima Voucher 10K
                    </h4>
                    <p className="text-neutral-700/70 text-sm">
                      Anda dan teman Anda masing-masing mendapatkan voucher 10K
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-neutral-700 font-medium mb-1">
                  Kode Referral Anda:
                </p>
                <div className="flex items-center justify-between w-full p-3 px-6 bg-neutral-700/10 backdrop-blur-sm rounded-lg border border-neutral-700/20 mt-4">
                  <div className="font-mono text-lg text-neutral-700 font-bold tracking-wider">
                    {session?.user.referralCode || 'LOADING...'}
                  </div>
                  <Button
                    onClick={copyToClipboard}
                    variant="secondary"
                    size="sm"
                    className="transition-all duration-300 bg-neutral-800 text-neutral-100 hover:bg-neutral-800 hover:text-neutral-100"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {copied ? 'Disalin' : 'Salin'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-neutral-700/70 text-xs">
                *Syarat dan ketentuan berlaku. Voucher akan diberikan setelah
                teman Anda berhasil mendaftar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
