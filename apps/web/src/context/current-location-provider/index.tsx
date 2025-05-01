'use client';

import { apiclient } from '@/lib/apiclient';
import { USER_CURRENT_LOCATION_KEY } from '@/lib/constants/local-storage-key';
import { readStorage, writeStorage } from '@/lib/local-storage';
import { GeocodingResponse } from '@/lib/types/geocoding-response';
import { GetAllAddressResponse } from '@/lib/types/get-all-address-response';
import { UserCurrentLocationType } from '@/lib/types/user-current-location-type';
import { useMutation } from '@tanstack/react-query';
import qs from 'query-string';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

type CurrentLocationContextType = {
  data: UserCurrentLocationType;
  mutate: (loc: UserCurrentLocationType) => void;
  isPending: boolean;
};

const CurrentLocationContext = createContext<CurrentLocationContextType | null>(
  null,
);

type Props = {
  children: ReactNode;
};

export const CurrentLocationProvider = ({ children }: Props) => {
  const [data, setData] = useState(getStoredLocation());

  const { mutate: fetchLocation, isPending } = useMutation({
    mutationFn: async () => {
      // Case 1
      const position = await getPosition();
      if (position) {
        const current = await getCurrentLocation({
          lat: position.latitude,
          lng: position.longitude,
        });
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

      // Case 2
      const userAddr = await getUserDefaultAddress();
      if (userAddr) {
        return {
          location: {
            label: userAddr.label,
            address: userAddr.address,
            latitude: userAddr.latitude,
            longitude: userAddr.longitude,
            addressDetail: {
              city: userAddr.city,
              province: userAddr.province,
              postalCode: userAddr.postalCode,
            },
            recipientDetail: {
              phone: userAddr.phone,
              recipient: userAddr.recipient,
            },
          },
          source: 'address',
        } as UserCurrentLocationType;
      }

      // Case 3
      return null as UserCurrentLocationType;
    },

    onSuccess: (data) => {
      setData(data);
      saveLocationToStorage(data);
    },
  });

  useEffect(() => {
    if (!location) {
      fetchLocation();
    }
  }, []);

  const setCurrentLocation = useCallback((data: UserCurrentLocationType) => {
    setData(data);
    saveLocationToStorage(data);
  }, []);

  return (
    <CurrentLocationContext.Provider
      value={{ data, mutate: setCurrentLocation, isPending }}
    >
      {children}
    </CurrentLocationContext.Provider>
  );
};

// Custom hook for accessing the context safely
export const useCurrentLocation = () => {
  const context = useContext(CurrentLocationContext);
  if (!context) {
    throw new Error(
      'useCurrentLocation must be used within a CurrentLocationProvider',
    );
  }
  return context;
};

/* ------------------------ Helper Function ----------------------- */

function getStoredLocation() {
  return readStorage<UserCurrentLocationType>({
    key: USER_CURRENT_LOCATION_KEY,
  });
}

function saveLocationToStorage(param: UserCurrentLocationType | null) {
  return writeStorage({
    key: USER_CURRENT_LOCATION_KEY,
    data: param,
  });
}

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
