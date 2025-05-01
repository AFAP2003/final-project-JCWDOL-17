'use client';

import { useCurrentLocation } from '@/context/current-location-provider';
import { apiclient } from '@/lib/apiclient';
import { GetAllAddressResponse } from '@/lib/types/get-all-address-response';
import { useQuery } from '@tanstack/react-query';
import { Map } from 'lucide-react';
import { useState } from 'react';
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

export default function UseMyAddressButton() {
  const [open, setOpen] = useState(false);
  const { mutate: setCurrentLocation } = useCurrentLocation();

  // TODO: handle error
  const { data: addresses, isPending } = useQuery({
    queryKey: ['user-location', 'list-address'],
    queryFn: async () => {
      const { data } = await apiclient.get<GetAllAddressResponse>(
        `/user/address?pageSize=100`,
      );
      return data.addresses;
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        <Button className="flex w-full text-sm bg-neutral-700 text-neutral-200 hover:text-neutral-300 hover:bg-neutral-700">
          <Map />
          <span>Use My Address</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-primary border-neutral-500 max-w-3xl text-neutral-200">
        <DialogHeader className="text-neutral-200">
          <DialogTitle>Select Address</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <Separator className="bg-neutral-500 my-3" />

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
                  setOpen(false);
                }}
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
