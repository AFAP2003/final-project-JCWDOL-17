'use client';

import { useCurrentLocation } from '@/context/current-location-provider';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { useSession } from '@/lib/auth/client';
import { GetAllAddressResponse } from '@/lib/types/get-all-address-response';
import { useMutation } from '@tanstack/react-query';
import { Map } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Separator } from '../ui/separator';
import AddressCard from './address-card';

type Props = {
  onDialogOpenChange?: (val: boolean) => void;
};

export default function UseMyAddressButton(props: Props) {
  const [dialogAddressOpen, setDialogAddressOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alertDescription, setAlertDescription] = useState<string | null>(null);

  useEffect(() => {
    if (props.onDialogOpenChange) {
      props.onDialogOpenChange(dialogAddressOpen || alertDialogOpen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogAddressOpen, alertDialogOpen]);

  const { data: session } = useSession();

  const { mutate: setCurrentLocation } = useCurrentLocation();
  const [addresses, setAddresses] = useState<
    GetAllAddressResponse['addresses'] | null
  >(null);

  const { mutate: fetchAddress, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await apiclient.get<GetAllAddressResponse>(
        `/user/address?pageSize=100`,
      );
      return data.addresses;
    },

    onError: () => {
      toast({
        description:
          'Sorry we have problem in our server, please try again later',
        variant: 'destructive',
      });
    },
  });

  return (
    <>
      <Button
        onClick={() => {
          if (!session?.user) {
            setAlertDialogOpen(true);
            setAlertDescription('You must login first to use this feature.');
            return;
          }
          fetchAddress(undefined, {
            onSuccess: (data) => {
              if (data.length === 0) {
                setAlertDialogOpen(true);
                setAlertDescription("You don't have an address set up.");
              } else {
                setAddresses(data);
                setDialogAddressOpen(true);
              }
            },
          });
        }}
        className="flex w-full text-sm bg-neutral-700 text-neutral-200 hover:text-neutral-300 hover:bg-neutral-700"
      >
        <Map />
        <span>Use My Address</span>
      </Button>

      {/* Dialog Alert */}
      <Dialog
        open={alertDialogOpen}
        onOpenChange={(val) => {
          if (val === false) {
            setAlertDescription(null);
          }
          setAlertDialogOpen(val);
        }}
        modal={false}
      >
        <DialogTrigger asChild className="hidden"></DialogTrigger>
        <DialogContent className="bg-neutral-800 border-neutral-500 text-neutral-200">
          <DialogHeader className="text-neutral-200">
            <DialogTitle className="hidden"></DialogTitle>
            <DialogDescription className="text-base text-neutral-200">
              {alertDescription}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Dialog Address */}
      <Dialog
        open={dialogAddressOpen}
        onOpenChange={setDialogAddressOpen}
        modal={false}
      >
        <DialogTrigger asChild className="hidden"></DialogTrigger>
        <DialogContent className="bg-neutral-800 border-neutral-500 max-w-3xl text-neutral-200">
          <DialogHeader className="text-neutral-200">
            <DialogTitle>Select Address</DialogTitle>
            <DialogDescription className="hidden"></DialogDescription>
          </DialogHeader>

          <Separator className="bg-neutral-500 mt-3" />

          <div>
            {addresses?.map((address) => (
              <div key={address.id} className="">
                <AddressCard
                  address={address}
                  onClick={(address) => {
                    setCurrentLocation({
                      location: {
                        label: address.label,
                        address: address.address,
                        latitude: address.latitude,
                        longitude: address.longitude,
                        addressDetail: {
                          city: address.city,
                          province: address.province,
                          postalCode: address.postalCode,
                        },
                        recipientDetail: {
                          phone: address.phone,
                          recipient: address.recipient,
                        },
                      },
                      source: 'address',
                    });
                    setDialogAddressOpen(false);
                  }}
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
