'use client';

import { Button } from '@/components/ui/button';
import { useLocation } from '@/context/location-provider';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { useSession } from '@/lib/auth/client';
import { GeocodingResponse } from '@/lib/types/geocoding-response';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { LocateFixed } from 'lucide-react';
import qs from 'query-string';
import { useEffect, useState } from 'react';
import { useGeolocated } from 'react-geolocated';
import ErrorDialog from './error-dialog';

type Props = {
  setRootDialogHidden: (value: boolean) => void;
};

export default function CurrentLocationButton({ setRootDialogHidden }: Props) {
  const { data: session } = useSession();
  const { mutate: setLocation } = useLocation();
  const geo = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    watchLocationPermissionChange: true,
    watchPosition: true,
  });
  const { mutate: fetchCurrentLocation, isPending } = useMutation({
    mutationFn: async () => {
      const query = qs.stringify(
        {
          lat: geo?.coords?.latitude,
          lng: geo?.coords?.longitude,
          resultSize: 1,
        },
        {
          skipEmptyString: true,
          skipNull: true,
        },
      );

      const { data } = await apiclient.get<GeocodingResponse>(
        `/location/geocoding?${query}`,
      );

      if (data.length <= 0) {
        throw new Error('Error detecting current location');
      }
      return data[0];
    },
    onSuccess: (data) => {
      setLocation({
        label: data.name || '',
        address: data.address,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
        phone: session?.user.phone,
        recipient: session?.user.name,
      });
    },
    onError: (err: Error | AxiosError) => {
      if (err instanceof AxiosError) {
        toast({
          description:
            'Sorry we have problem in our server, please try again later',
          variant: 'destructive',
        });
        return;
      }

      if (err instanceof Error) {
        setErrorDialogOpen(true);
        setErrorDialogContent({
          title: 'Gagal Mendeteksi Lokasi',
          description:
            'Maaf, kami tidak dapat mengakses lokasimu. Pastikan izin lokasi telah diaktifkan dan koneksi internet stabil, lalu coba lagi.',
        });
      }
    },
  });

  const [errorDialogContent, setErrorDialogContent] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  useEffect(() => {
    if (errorDialogOpen === true) {
      setRootDialogHidden(true);
    } else {
      setRootDialogHidden(false);
    }
  }, [errorDialogOpen, setRootDialogHidden]);

  const handleTriggerClick = () => {
    if (!geo.isGeolocationEnabled) {
      setErrorDialogOpen(true);
      setErrorDialogContent({
        title: 'Izinkan Akses Lokasi',
        description:
          'Kami membutuhkan izin lokasi untuk menampilkan layanan atau toko terdekat dari tempatmu berada',
      });
      return;
    }

    if (!geo.coords) {
      setErrorDialogOpen(true);
      setErrorDialogContent({
        title: 'Gagal Mendeteksi Lokasi',
        description:
          'Maaf, kami tidak dapat mengakses lokasimu. Pastikan izin lokasi telah diaktifkan dan koneksi internet stabil, lalu coba lagi.',
      });
      return;
    }

    geo.getPosition(); // trigger geo location;
    fetchCurrentLocation();
  };

  return (
    <>
      <Button
        disabled={isPending}
        onClick={handleTriggerClick}
        className="flex w-full text-sm bg-neutral-700 text-neutral-200 hover:text-neutral-300 hover:bg-neutral-700"
      >
        <LocateFixed />
        <span>Gunakan Lokasi Saat Ini</span>
      </Button>

      <ErrorDialog
        open={errorDialogOpen}
        title={errorDialogContent?.title || ''}
        description={errorDialogContent?.description || ''}
        onOpenChange={setErrorDialogOpen}
      />
    </>
  );
}
