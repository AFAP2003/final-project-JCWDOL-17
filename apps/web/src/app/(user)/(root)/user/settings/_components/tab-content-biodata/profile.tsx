'use client';

import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { Session } from '@/lib/types/session';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Camera, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';

type Props = {
  user: Session['user'];
  refetchSession: () => void;
};

export default function Profile({ user, refetchSession }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadProfile, isPending } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      const { data } = await apiclient.post('/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      toast({
        description: 'Your profile picture is set up!',
      });
      refetchSession();
    },

    onError: (error: AxiosError) => {
      const response = error.response?.data as { error: { message: string } };
      const message = response?.error?.message;

      if (error.status! >= 500) {
        toast({
          description:
            'Sorry we have problem in our server, please try again later',
          variant: 'destructive',
        });
        return;
      }

      toast({
        description: message,
        variant: 'destructive',
      });
    },
  });

  return (
    <>
      <div className="relative aspect-square mb-6 w-full sm:w-60 mx-auto group">
        {!user.image ? (
          <div className="size-full bg-neutral-200 flex items-center justify-center rounded-lg overflow-hidden">
            <span className="text-8xl font-[300] text-neutral-600">{`${user.name.at(0)?.toUpperCase()}`}</span>
          </div>
        ) : (
          <Image
            src={user.image}
            alt="User Image"
            fill
            className="rounded-lg object-cover"
          />
        )}

        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm rounded-lg">
            <Loader2 className="w-10 h-10 animate-spin text-neutral-200" />
          </div>
        )}
      </div>
      <Button
        onClick={() => fileInputRef.current?.click()}
        className="w-full max-w-60 mb-4 gap-2 bg-neutral-800/90 hover:bg-neutral-800/90 text-neutral-200 hover:text-neutral-300"
      >
        <Camera className="w-4 h-4 max-[380px]:hidden" />
        Ganti Photo
      </Button>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg, image/png, image/jpg"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const MB_1 = 1 * 1024 * 1024;
          if (file.size > MB_1) {
            toast({
              description: 'File size exceeds 1MB.',
              variant: 'destructive',
            });
            return;
          }
          uploadProfile(file);
        }}
        hidden
      />

      <p className="w-60 text-sm text-neutral-500 text-center max-sm:text-xs">
        File size: maximum 1MB
        <br />
        Formats: JPG, JPEG, PNG
      </p>
    </>
  );
}
