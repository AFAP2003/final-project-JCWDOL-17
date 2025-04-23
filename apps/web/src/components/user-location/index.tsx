'use client';

import { useCurrentLocation } from '@/context/current-location-provider';
import { MapPinCheck, MapPinned } from 'lucide-react';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Separator } from '../ui/separator';
import { FloatingActionButton } from './floating-action-button';
import UseMyAddressButton from './use-my-address-button';

type Props = {};

export default function UserLocation({}: Props) {
  const { data, isPending } = useCurrentLocation();

  return (
    <div>
      <FloatingActionButton
        icon={<MapPinned />}
        className="size-14 bottom-6 right-6"
      >
        {isPending ? (
          <DialogContent>
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogContent>
        ) : (
          <DialogContent className="bg-neutral-800 border-neutral-500 text-neutral-200 p-6">
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
                        <p>
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
            <div>
              {/* <div className="flex items-center gap-3 px-3 py-1.5 rounded-md cursor-pointer hover:bg-neutral-700 bg-neutral-700">
              <LocateFixed />
              <div className="text-sm">Use Current Location</div>
            </div>

            <div className="flex items-center gap-3 px-3 py-1.5 rounded-md cursor-pointer hover:bg-neutral-700 bg-neutral-700">
              <LocateFixed />
              <div className="text-sm">Change Location</div>
            </div> */}

              <UseMyAddressButton />
            </div>
          </DialogContent>
        )}
      </FloatingActionButton>
    </div>
  );
}
