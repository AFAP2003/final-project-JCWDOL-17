'use client';

import { useCurrentLocation } from '@/context/current-location-provider';
import { apiclient } from '@/lib/apiclient';
import { GeocodingResponse } from '@/lib/types/geocoding-response';
import { UserCurrentLocationType } from '@/lib/types/user-current-location-type';
import { useMutation } from '@tanstack/react-query';
import { LocateFixed } from 'lucide-react';
import qs from 'query-string';
import { Button } from '../ui/button';

async function getPosition(): Promise<GeolocationCoordinates | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      () => resolve(null), // permission denied / error
      {
        enableHighAccuracy: true,
        timeout: Infinity,
      },
    );
  });
}

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

export default function UseCurrentLocationButton() {
  const { mutate: setCurrentLocation } = useCurrentLocation();

  // TODO: handle error
  const { data: address, isPending } = useMutation({
    mutationFn: async () => {
      const position = await getPosition();
      if (position) {
        const current = await getCurrentLocation({
          lat: position.latitude,
          lng: position.longitude,
        });
        if (!current) return null;
        if (current) {
          return {
            location: {
              label: current.name,
              address: current.address,
              latitude: current.latitude,
              longitude: current.longitude,
            },
            source: 'geolocation',
          } as UserCurrentLocationType;
        }
      }
    },
  });

  return (
    <Button className="flex w-full text-sm bg-neutral-700 text-neutral-200 hover:text-neutral-300 hover:bg-neutral-700">
      <LocateFixed />
      <span>Use Current Location</span>
    </Button>
  );
}
