'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import UserLocation from '@/components/user-location';
import { useCheckout } from '@/context/checkout-provider';
import { useLocation } from '@/context/location-provider';
import { useSession } from '@/lib/auth/client';
import { LocationType } from '@/lib/types/location-type';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import {
  MapPinIcon as MapPinCheck,
  Milestone,
  PencilIcon,
  User2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .regex(
      /^[A-Za-z]+(?:[' -][A-Za-z]+)*$/,
      'Name can only contain letters, spaces, hyphens, and apostrophes',
    ),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => {
        if (value === '') return true;
        // Remove spaces, dashes, etc.
        const sanitized = value.replace(/[\s-]/g, '');
        const phoneRX = /^(?:\+62|0)[2-9]{1}[0-9]{7,11}$/;
        return phoneRX.test(sanitized);
      },
      {
        message: 'Phone number must be a valid Indonesian number.',
      },
    )
    .optional(),
});

export default function DestinationSection() {
  const { destination } = useCheckout();
  const { data: session } = useSession();
  const { data: location, mutate: setLocation } = useLocation();

  const [editRecepientDialogOpen, setEditRecepientDialogOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (editRecepientDialogOpen === false) {
      form.reset();
    } else {
      form.setValue('name', destination?.recipient || session?.user.name || '');
      form.setValue('phone', destination?.phone || session?.user.phone || '');
    }
  }, [editRecepientDialogOpen]);

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    let phone = data.phone || null;
    setLocation({
      ...location,
      recipient: data.name,
      phone: phone,
    } as LocationType);
    setEditRecepientDialogOpen(false);
  };

  return (
    <>
      <Card className="bg-neutral-50 border-neutral-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-neutral-700">
            <h3>
              <MapPinCheck className="w-5 h-5 inline-block mr-2 text-neutral-600" />
              Diantar Ke
            </h3>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center w-full">
                <h4 className="text-sm font-medium flex items-center text-neutral-700">
                  <Milestone className="w-4 h-4 mr-1 text-neutral-500" />
                  Alamat
                </h4>

                <UserLocation>
                  <div className="flex items-center gap-2 text-xs">
                    <PencilIcon className="w-4 h-4 text-red-500" />{' '}
                    <span className="">Ganti</span>
                  </div>
                </UserLocation>
              </div>
              <div className="flex w-full items-start gap-4 p-4 rounded-xl border border-neutral-200 bg-white/80">
                <div className="text-neutral-50 bg-neutral-700 p-2 rounded-full">
                  <MapPinCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-medium text-neutral-700">
                    {destination?.label}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {destination?.address}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {destination?.city}, {destination?.province}{' '}
                    {destination?.postalCode}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center w-full">
                <h4 className="text-sm font-medium flex items-center text-neutral-700">
                  <User2 className="w-4 h-4 mr-1 text-neutral-500" />
                  Penerima
                </h4>
                <div
                  onClick={() => setEditRecepientDialogOpen(true)}
                  className="flex items-center gap-2 text-xs cursor-pointer"
                >
                  <PencilIcon className="w-4 h-4 text-red-500" />{' '}
                  <span className="">Ubah</span>
                </div>
              </div>
              <div className="flex w-full items-start gap-4 p-4 rounded-xl border border-neutral-200 bg-white/80">
                <div className="space-y-1">
                  <p className="text-base font-medium text-neutral-700">
                    {destination?.recipient || session?.user.name}
                  </p>
                  <p className="text-sm text-neutral-600">
                    <span className="font-medium text-neutral-500">Telp</span> :{' '}
                    {destination?.phone || session?.user.phone || '-'}
                  </p>
                </div>
              </div>
            </div>

            <div></div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={editRecepientDialogOpen}
        onOpenChange={setEditRecepientDialogOpen}
      >
        <DialogContent className="bg-neutral-800 text-neutral-200 border-neutral-500">
          <DialogTitle className="hidden" />
          <DialogDescription className="hidden" />

          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Detail Penerima
            </h3>
            <Separator className="bg-neutral-500 my-6" />

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center text-neutral-300">
                        Nama Penerima
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          className="resize-none focus-visible:ring-0 focus:border-neutral-500 text-neutral-800 bg-white/80 rounded-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center text-neutral-300">
                        Telp Penerima
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="08xxx"
                          className="resize-none focus-visible:ring-0 focus:border-neutral-500 text-neutral-800 bg-white/80 rounded-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-neutral-700 hover:bg-neutral-700 hover:text-neutral-300 text-neutral-200 rounded-lg"
                >
                  Save Changes
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
