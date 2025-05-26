'use client';

/* eslint-disable react-hooks/exhaustive-deps */

import { GeocodingResponse } from '@/lib/types/geocoding-response';

import 'leaflet/dist/leaflet.css';
import { MapPinCheck } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const Map = dynamic(() => import('@/components/map'), {
  ssr: false,
});

type Props = {
  initialPosition: {
    lat: number;
    lng: number;
  };
  onLocationChange: (
    loc: GeocodingResponse[number] | null,
    isInitial: boolean,
  ) => void;
};

export default function AddressMap(props: Props) {
  const [pinnedLocation, setPinnedLocation] = useState<
    GeocodingResponse[number] | null
  >(null);

  return (
    <div className="relative border-neutral-500 border-2 px-3 sm:px-6 py-6 rounded-lg shadow-md space-y-6">
      <h3 className="font-medium">Pintpoint Your Address</h3>

      <div className="overflow-hidden rounded-lg relative space-y-6">
        <Map
          className="sm:h-[360px] aspect-auto"
          initialPosition={props.initialPosition}
          onLocationChange={(pinned, isInitial) => {
            setPinnedLocation(pinned);
            props.onLocationChange(pinned, isInitial);
          }}
          onLocationChangePending={() => {}}
        />

        <div className="flex w-full items-start gap-4 p-4 rounded-xl border border-neutral-700 shadow-sm">
          <div className="text-red-500 bg-neutral-700/30 p-2 rounded-full max-sm:hidden">
            <MapPinCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium text-white">
              {pinnedLocation?.name}
            </p>
            <p className="text-sm text-neutral-400">
              {pinnedLocation?.address}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
