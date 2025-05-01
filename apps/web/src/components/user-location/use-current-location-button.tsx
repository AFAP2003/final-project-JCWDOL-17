'use client';

import { useCurrentLocation } from '@/context/current-location-provider';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { GeocodingResponse } from '@/lib/types/geocoding-response';
import { UserCurrentLocationType } from '@/lib/types/user-current-location-type';
import { useMutation } from '@tanstack/react-query';
import { LocateFixed } from 'lucide-react';
import qs from 'query-string';
import { useEffect, useState } from 'react';
import { useGeolocated } from 'react-geolocated';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

async function getCurrentLocation(param: { lat: number; lng: number }) {
  const queryObj = {
    lat: param.lat,
    lng: param.lng,
    resultSize: 1,
  };
  const query = qs.stringify(queryObj, {
    skipEmptyString: true,
    skipNull: true,
  });

  const { data } = await apiclient.get<GeocodingResponse>(
    `/location/geocoding?${query}`,
  );
  if (data.length <= 0) return null;
  return data[0];
}

type Props = {
  onDialogOpenChange?: (val: boolean) => void;
};

export default function UseCurrentLocationButton(props: Props) {
  const { mutate: setCurrentLocation } = useCurrentLocation();
  const geo = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    watchLocationPermissionChange: true,
  });

  const [alertOpen, setAlertOpen] = useState(false);
  useEffect(() => {
    if (props.onDialogOpenChange) {
      props.onDialogOpenChange(alertOpen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertOpen]);

  const { mutate: fetchCurrentLocation, isPending } = useMutation({
    mutationFn: async () => {
      if (!geo.coords) return null;

      const current = await getCurrentLocation({
        lat: geo.coords.latitude,
        lng: geo.coords.longitude,
      });

      if (!current) return null;

      return {
        location: {
          label: current.name,
          address: current.address,
          latitude: current.latitude,
          longitude: current.longitude,
        },
        source: 'geolocation',
      } as UserCurrentLocationType;
    },
    onSuccess: (data) => {
      if (!data) {
        toast({
          description:
            'Failed to retrieve your current location. Please try again shortly.',
          variant: 'destructive',
        });
      } else {
        setCurrentLocation(data);
      }
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
        disabled={isPending}
        onClick={() => {
          if (!geo.isGeolocationEnabled) {
            setAlertOpen(true);
            return;
          }

          geo.getPosition(); // trigger geo location;
          fetchCurrentLocation();
        }}
        className="flex w-full text-sm bg-neutral-700 text-neutral-200 hover:text-neutral-300 hover:bg-neutral-700"
      >
        <LocateFixed />
        <span>Use Current Location</span>
      </Button>

      <Dialog open={alertOpen} onOpenChange={setAlertOpen} modal={false}>
        <DialogTrigger asChild className="hidden"></DialogTrigger>
        <DialogContent className="bg-neutral-800 border-neutral-500 text-neutral-200">
          <DialogHeader className="text-neutral-200">
            <DialogTitle className="hidden"></DialogTitle>
            <DialogDescription className="text-base text-neutral-200">
              Please enable location permissions in your browser&apos;s site
              settings.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
