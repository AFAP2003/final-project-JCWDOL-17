'use client';

import { useCurrentLocation } from '@/context/current-location-provider';
import { cn } from '@/lib/utils';
import { MapPinCheck, MapPinned } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Separator } from '../ui/separator';
import PintPointButton from './pint-point-button';
import UseCurrentLocationButton from './use-current-location-button';
import UseMyAddressButton from './use-my-address-button';

type Props = {
  iconClass?: string;
  iconContainerClass?: string;
};

export default function UserLocation(props: Props) {
  const { data, isPending } = useCurrentLocation();
  const [isStacking, setIsStacking] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setDialogOpen(true)}
        className={cn('cursor-pointer', props.iconContainerClass)}
      >
        <MapPinned className={cn('size-7', props.iconClass)} />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {isPending ? (
          <DialogContent>
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogContent>
        ) : (
          <DialogContent
            className={cn(
              'bg-neutral-800 border-neutral-500 text-neutral-200 p-6 opacity-100',
              isStacking && 'opacity-0',
            )}
          >
            <DialogHeader>
              <DialogTitle>Where are you at now?</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>

            <Separator className="bg-neutral-500 my-3" />

            {/* Selected Location */}
            <div className="mb-6">
              {data ? (
                <div className="flex w-full gap-6 items-center">
                  <div className="text-red-500">
                    <MapPinCheck className="shrink-0" />
                  </div>
                  <div className="space-y-1.5">
                    {data.source === 'geolocation' && (
                      <>
                        <p className="text-base">{data.location.label}</p>
                        <p className="text-sm text-neutral-300">
                          {data.location.address}
                        </p>
                      </>
                    )}

                    {data.source === 'address' && (
                      <>
                        <p className="text-base">{data.location.label}</p>
                        <p className="text-sm text-neutral-300">
                          {data.location.address}
                        </p>
                        <p className="text-sm">
                          {data.location.addressDetail.city},{' '}
                          {data.location.addressDetail.province} |{' '}
                          {data.location.addressDetail.postalCode}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div>No Location has been selected.</div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col size-full gap-3">
              <UseMyAddressButton
                onDialogOpenChange={(val) => {
                  setIsStacking(val);
                }}
              />
              <UseCurrentLocationButton
                onDialogOpenChange={(val) => {
                  setIsStacking(val);
                }}
              />

              <PintPointButton
                onDialogOpenChange={(val) => {
                  console.log({ val });
                  setIsStacking(val);
                }}
              />
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
