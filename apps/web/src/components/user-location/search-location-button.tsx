'use client';

import { useLocation } from '@/context/location-provider';
import { useSession } from '@/lib/auth/client';
import { GeocodingResponse } from '@/lib/types/geocoding-response';
import { MapPinCheck, MapPinned } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useGeolocated } from 'react-geolocated';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../ui/dialog';
import { Separator } from '../ui/separator';
const Map = dynamic(() => import('../map'), {
  ssr: false,
});

type Props = {
  setRootDialogHidden: (value: boolean) => void;
};

export default function SearchLocationButton({ setRootDialogHidden }: Props) {
  const { data: session } = useSession();
  const { mutate: setLocation, data: location } = useLocation();
  const geo = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    watchLocationPermissionChange: true,
    watchPosition: true,
  });

  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [pinnedLocation, setPinnedLocation] = useState<
    GeocodingResponse[number] | null
  >(null);

  useEffect(() => {
    if (mapDialogOpen === true) {
      setRootDialogHidden(true);
    } else {
      setRootDialogHidden(false);
    }
  }, [mapDialogOpen, setRootDialogHidden]);

  const handleTriggerClick = () => {
    setMapDialogOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleTriggerClick}
        className="flex w-full text-sm bg-neutral-700 text-neutral-200 hover:text-neutral-300 hover:bg-neutral-700"
      >
        <MapPinned />
        <span>Cari Lokasi di Map</span>
      </Button>

      <Dialog
        open={mapDialogOpen}
        onOpenChange={setMapDialogOpen}
        modal={false}
      >
        <DialogContent className="bg-neutral-800 border-neutral-500 text-neutral-200 max-w-3xl">
          <DialogTitle className="hidden"></DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>

          <div>
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Cari Lokasimu
            </h3>

            <Separator className="bg-neutral-500 my-6" />

            <div className="px-3 relative space-y-6">
              <Map
                initialPosition={(() => {
                  const initialpoint: { lat: number; lng: number } = {
                    lat: -6.175205678767613,
                    lng: 106.82716967509717,
                  };
                  if (location) {
                    initialpoint.lat = location.latitude;
                    initialpoint.lng = location.longitude;
                  } else if (geo.coords) {
                    initialpoint.lat = geo.coords.latitude;
                    initialpoint.lng = geo.coords.longitude;
                  }
                  return initialpoint;
                })()}
                onLocationChange={(pinned) => {
                  setPinnedLocation(pinned);
                }}
                onLocationChangePending={() => {}}
              />

              <div className="">
                <div className="flex w-full items-start gap-4 p-4 rounded-xl border border-neutral-700 shadow-sm">
                  <div className="text-red-500 bg-neutral-700/30 p-2 rounded-full">
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

            <Separator className="bg-neutral-500 my-6" />

            <Button
              onClick={() => {
                setLocation({
                  label: pinnedLocation?.name || '',
                  address: pinnedLocation?.address || '',
                  latitude: pinnedLocation?.latitude || 0,
                  longitude: pinnedLocation?.longitude || 0,
                  city: pinnedLocation?.city,
                  province: pinnedLocation?.province,
                  postalCode: pinnedLocation?.postalCode,
                  phone: session?.user.phone,
                  recipient: session?.user.name,
                });
                setMapDialogOpen(false);
              }}
              className="bg-neutral-700 text-neutral-200 hover:bg-neutral-700 hover:text-neutral-300 w-full"
            >
              Pilih Lokasi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
