'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useLocation } from '@/context/location-provider';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { useSession } from '@/lib/auth/client';
import { GetAllAddressResponse } from '@/lib/types/get-all-address-response';
import { useMutation } from '@tanstack/react-query';
import { Map } from 'lucide-react';
import { useEffect, useState } from 'react';
import AddressCard from './address-card';
import ErrorDialog from './error-dialog';

type Props = {
  setRootDialogHidden: (value: boolean) => void;
};

export default function MyAddressButton({ setRootDialogHidden }: Props) {
  const { data: session } = useSession();
  const { mutate: setLocation } = useLocation();

  const [dialogAddressOpen, setDialogAddressOpen] = useState(false);
  const [addresses, setAddresses] = useState<
    GetAllAddressResponse['addresses']
  >([]);

  const { mutate: fetchAddress, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await apiclient.get<GetAllAddressResponse>(
        `/user/address?pageSize=100`,
      );
      return data.addresses;
    },
    onSuccess: (data) => {
      setAddresses(data);
      setDialogAddressOpen(true);
    },
    onError: () => {
      toast({
        description:
          'Sorry we have problem in our server, please try again later',
        variant: 'destructive',
      });
    },
  });

  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogContent, setErrorDialogContent] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    if (dialogAddressOpen === true || errorDialogOpen == true) {
      setRootDialogHidden(true);
    } else {
      setRootDialogHidden(false);
    }
  }, [dialogAddressOpen, errorDialogOpen, setRootDialogHidden]);

  const handleTriggerClick = () => {
    if (!session?.user) {
      setErrorDialogOpen(true);
      setErrorDialogContent({
        title: 'Kamu belum login',
        description:
          'Ups! Kamu perlu login terlebih dahulu agar kami bisa mengakses alamat yang tersimpan.',
      });
      return;
    }
    fetchAddress();
  };

  return (
    <>
      <Button
        onClick={handleTriggerClick}
        className="flex w-full text-sm bg-neutral-700 text-neutral-200 hover:text-neutral-300 hover:bg-neutral-700"
      >
        <Map />
        <span>Gunakan Alamat</span>
      </Button>

      {/* Dialog Address */}
      <Dialog
        open={dialogAddressOpen}
        onOpenChange={setDialogAddressOpen}
        modal={false}
      >
        <DialogTrigger asChild className="hidden"></DialogTrigger>
        <DialogContent className="bg-neutral-800 border-neutral-500 max-w-3xl text-neutral-200">
          <DialogTitle className="hidden"></DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>

          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Pilih Alamat Tersimpan
            </h3>
            <Separator className="bg-neutral-500 my-6" />

            <ScrollArea className="h-full max-h-[480px] vertical-scroll">
              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((address, idx) => (
                    <AddressCard
                      key={idx}
                      address={address}
                      onClick={(address) => {
                        setLocation({
                          label: address.label,
                          address: address.address,
                          latitude: address.latitude,
                          longitude: address.longitude,
                          postalCode: address.postalCode,
                          city: address.city,
                          province: address.province,
                          phone: address.phone,
                          recipient: address.recipient,
                        });
                        setDialogAddressOpen(false);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-neutral-800 border border-neutral-700 text-base text-neutral-400">
                  Tidak ada alamat yang tersimpan.
                </div>
              )}
              <ScrollBar orientation="vertical" className="cursor-grab" />
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <ErrorDialog
        open={errorDialogOpen}
        title={errorDialogContent?.title || ''}
        description={errorDialogContent?.description || ''}
        onOpenChange={setErrorDialogOpen}
      />
    </>
  );
}
