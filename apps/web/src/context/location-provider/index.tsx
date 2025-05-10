'use client';

import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { useSession } from '@/lib/auth/client';
import { USER_CURRENT_LOCATION_KEY } from '@/lib/constants/local-storage-key';
import { readStorage, writeStorage } from '@/lib/local-storage';
import { GeocodingResponse } from '@/lib/types/geocoding-response';
import { GetAllAddressResponse } from '@/lib/types/get-all-address-response';
import { LocationType } from '@/lib/types/location-type';
import { UseMutateFunction, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import qs from 'query-string';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useGeolocated } from 'react-geolocated';

type LocationContextType = {
  data: LocationType;
  mutate: (loc: LocationType) => void;
  isPending: boolean;
  isInitial: boolean;
  coords?: GeolocationCoordinates;
  fetchLocation: UseMutateFunction<
    LocationType,
    AxiosError<unknown, any>,
    | {
        fallbackAddress: boolean;
      }
    | undefined,
    unknown
  >;
};

const LocationContext = createContext<LocationContextType | null>(null);

type Props = {
  children: ReactNode;
};

export const LocationProvider = ({ children }: Props) => {
  const [data, setData] = useState(getStoredLocation());
  const [isInitial, setIsInitial] = useState(true);
  const geo = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    watchLocationPermissionChange: true,
    watchPosition: true,
  });
  const { data: session } = useSession();

  const { mutate: fetchLocation, isPending } = useMutation({
    mutationFn: async (opt?: {
      fallbackAddress: boolean;
    }): Promise<LocationType> => {
      // Case 1: Geolocation coordinates available
      if (geo.coords) {
        const current = await getCurrentLocation({
          lat: geo.coords.latitude,
          lng: geo.coords.longitude,
        });

        if (current) {
          return {
            label: current.name || '',
            address: current.address,
            city: current.city,
            province: current.province,
            postalCode: current.postalCode!,
            latitude: current.latitude,
            longitude: current.longitude,
            recipient: session?.user.name,
            phone: session?.user.phone,
          };
        }
      }

      // Case 2: Use user default address
      if (opt?.fallbackAddress) {
        const userAddr = await getUserDefaultAddress();
        if (userAddr) {
          return {
            label: userAddr.label,
            address: userAddr.address,
            city: userAddr.city,
            province: userAddr.province,
            postalCode: userAddr.postalCode,
            latitude: userAddr.latitude,
            longitude: userAddr.longitude,
            recipient: userAddr.recipient,
            phone: userAddr.phone,
          };
        }
      }

      // Case 3: Fallback - null
      return null;
    },

    onSuccess: (data) => {
      if (data) {
        setData(data);
        saveLocationToStorage(data);
      }
    },

    onError: (err: AxiosError) => {
      if (err.status! >= 500) {
        toast({
          description:
            'Sorry we have problem in our server, please try again later',
          variant: 'destructive',
        });
      }
    },
  });

  const setLocation = useCallback((data: LocationType) => {
    setData(data);
    saveLocationToStorage(data);
    setIsInitial(false);
  }, []);

  return (
    <LocationContext.Provider
      value={{
        data,
        mutate: setLocation,
        isPending,
        isInitial,
        coords: geo.coords,
        fetchLocation: fetchLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

// Custom hook for accessing the context safely
export const useLocation = (opt?: { fallbackAddress: boolean }) => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  const { data, isPending, mutate, isInitial, coords, fetchLocation } = context;

  useEffect(() => {
    if (!data && isInitial) {
      fetchLocation(opt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, data, isInitial]);

  return { data, isPending, mutate };
};

/* ------------------------ Helper Function ----------------------- */

function getStoredLocation() {
  return readStorage<LocationType>({
    key: USER_CURRENT_LOCATION_KEY,
  });
}

function saveLocationToStorage(param: LocationType | null) {
  return writeStorage({
    key: USER_CURRENT_LOCATION_KEY,
    data: param,
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
  if (!data.at(0)?.postalCode) return null;
  return data[0];
}

async function getUserDefaultAddress() {
  const { data } = await apiclient.get<GetAllAddressResponse>(
    `/user/address?pageSize=100`,
  );
  if (data.addresses.length === 0) return null;

  const defaultAddr = data.addresses.find((a) => a.isDefault === true);
  if (defaultAddr) {
    return defaultAddr;
  } else {
    return data.addresses[0];
  }
}
