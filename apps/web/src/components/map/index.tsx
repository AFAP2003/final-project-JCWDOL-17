'use client';

import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { IDN_LATLONG_BOUND } from '@/lib/constants/indonesian-latlong-bounds';
import { GeocodingResponse } from '@/lib/types/geocoding-response';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  divIcon,
  DragEndEvent,
  LeafletEvent,
  Map as LeafletMap,
} from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, Search } from 'lucide-react';
import qs from 'query-string';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { FullscreenControl } from 'react-leaflet-fullscreen';
import 'react-leaflet-fullscreen/styles.css';
import { useDebounceValue } from 'usehooks-ts';

type Props = {
  initialPosition: {
    lat: number;
    lng: number;
  };
  onLocationChange: (
    loc: GeocodingResponse[number] | null,
    isInitial: boolean,
  ) => void;
  onLocationChangePending: (pending: boolean) => void;
  className?: string;
};

export default function Map(props: Props) {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [markerPosition, setMarkerPosition] = useState(props.initialPosition);
  const [dbMarkerPosition] = useDebounceValue(markerPosition, 1500);
  const [inputSearch, setInputSearch] = useState('');
  const [dbInputSearch] = useDebounceValue(inputSearch.trim(), 500);
  const [resultSearch, setResultSearch] = useState<GeocodingResponse>([]);
  const [searchPending, setSearchPending] = useState(false);
  const [pinnedLocation, setPinnedLocation] = useState<
    GeocodingResponse[number] | null
  >(null);
  const [isInitial, setIsInitial] = useState(true);
  const [isAfterSearch, setIsAfterSearch] = useState(false);

  const { mutate: fetchLocation } = useMutation({
    mutationFn: async (param: {
      name?: string;
      lat?: number;
      lng?: number;
      resultSize: number;
    }) => {
      const query = qs.stringify(param, {
        skipNull: true,
        skipEmptyString: true,
      });
      const { data } = await apiclient.get(`/location/geocoding?${query}`);
      return data as GeocodingResponse;
    },
    onError: (error: AxiosError) => {
      toast({
        description:
          'Sorry we have problem in our server, please try again later',
        variant: 'destructive',
      });
    },
  });

  const updateMarkerPosition = useCallback(
    (newPos: typeof markerPosition) => {
      if (
        newPos.lat !== markerPosition.lat ||
        newPos.lng !== markerPosition.lng
      ) {
        setMarkerPosition(newPos);
      }
    },
    [markerPosition],
  );

  const markerIcon = useMemo(() => MarkerIcon(), []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputSearch(e.target.value);
      setIsInitial(false);
    },
    [],
  );

  const handleMapRef = useCallback((map: LeafletMap) => {
    setMap(map);
  }, []);

  useEffect(() => {
    if (isAfterSearch) return;

    props.onLocationChangePending(true);
    fetchLocation(
      {
        lat: markerPosition.lat,
        lng: markerPosition.lng,
        resultSize: 1,
      },
      {
        onSuccess: (data) => {
          if (data.length > 0) {
            setPinnedLocation(data[0]);
          }
          if (
            props.initialPosition.lat !== dbMarkerPosition.lat &&
            props.initialPosition.lng !== dbMarkerPosition.lng &&
            isInitial
          ) {
            setIsInitial(false);
          }
          props.onLocationChangePending(false);
        },
      },
    );
  }, [dbMarkerPosition]);

  useEffect(() => {
    if (isInitial) return;

    setSearchPending(true);
    fetchLocation(
      {
        name: dbInputSearch,
        resultSize: 4,
      },
      {
        onSuccess: (data) => {
          setResultSearch(data);
          setSearchPending(false);
        },
      },
    );
  }, [dbInputSearch]);

  useEffect(() => {
    props.onLocationChange(pinnedLocation, isInitial);
  }, [pinnedLocation]);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg relative w-full aspect-video',
        props.className,
      )}
    >
      <MapContainer
        center={props.initialPosition}
        zoom={16}
        scrollWheelZoom={false}
        maxBounds={IDN_LATLONG_BOUND}
        maxBoundsViscosity={1.0}
        wheelPxPerZoomLevel={1000}
        style={{ borderRadius: '0.5rem' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={markerPosition} icon={markerIcon} />

        <MapEvent
          onDrag={(e) => {
            const center = e.target.getCenter();
            updateMarkerPosition({
              lat: center.lat,
              lng: center.lng,
            });
            if (isAfterSearch) setIsAfterSearch(false);
          }}
        />

        <ScrollWheelToggleOnHover />
        <FullscreenControl />
        <MapRefSetter setMapRef={handleMapRef} />
      </MapContainer>

      {/* Search UI */}
      <div
        className="absolute right-6 top-3 bg-neutral-50 w-full max-w-sm overflow-hidden border-[1.8px] rounded-lg shadow-sm group border-neutral-500 max-[660px]:hidden"
        style={{ zIndex: 1000 }}
      >
        <div className="relative flex items-center w-full px-2 py-1">
          <Search className="text-neutral-500 shrink-0" />
          <Input
            value={inputSearch}
            onChange={handleInputChange}
            className="focus-visible:ring-0 shadow-none border-none text-neutral-700"
            placeholder="Cari alamat..."
          />
        </div>

        {searchPending ? (
          <>
            <Separator className="bg-neutral-300" />
            <div className="flex justify-center items-center h-[70px] w-full">
              <Loader2 className="size-8 animate-spin text-neutral-400" />
            </div>
          </>
        ) : (
          <>
            {dbInputSearch && resultSearch.length > 0 && (
              <>
                <Separator className="my-2" />
                <div className="px-2 my-2">
                  {resultSearch.map((loc, idx) => (
                    <div key={idx} className="w-full">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          updateMarkerPosition({
                            lat: loc.latitude,
                            lng: loc.longitude,
                          });
                          setPinnedLocation(loc);
                          if (map) {
                            map.setView(
                              [loc.latitude, loc.longitude],
                              map.getZoom(),
                              {
                                animate: true,
                              },
                            );
                          }
                          setInputSearch('');
                          setResultSearch([]);
                          setIsAfterSearch(true);
                        }}
                        className="text-left text-xs pb-1 hover:bg-neutral-200 rounded-lg px-2"
                      >
                        <p className="font-medium text-neutral-700 text-sm">
                          {loc.name}
                        </p>
                        <p className="text-neutral-500">{loc.address}</p>
                      </button>
                      <Separator />
                    </div>
                  ))}
                </div>
              </>
            )}

            {dbInputSearch && resultSearch.length === 0 && (
              <>
                <Separator className="bg-neutral-300" />
                <div className="flex justify-center items-center h-[70px] w-full">
                  <p className="text-sm text-neutral-400 italic">
                    No result found
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Memoized static marker icon
function MarkerIcon() {
  return divIcon({
    className: 'marker-icon',
    html: `<div class="marker-shadow"></div>`,
    iconSize: [50, 50],
  });
}

// Set map reference to parent
function MapRefSetter({ setMapRef }: { setMapRef: (map: LeafletMap) => void }) {
  const map = useMap();
  useEffect(() => {
    setMapRef(map);
  }, [map, setMapRef]);
  return null;
}

// Enable scroll zoom on hover
function ScrollWheelToggleOnHover() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const enableZoom = () => map.scrollWheelZoom.enable();
    const disableZoom = () => map.scrollWheelZoom.disable();

    container.addEventListener('mouseenter', enableZoom);
    container.addEventListener('mouseleave', disableZoom);
    map.scrollWheelZoom.disable();

    return () => {
      container.removeEventListener('mouseenter', enableZoom);
      container.removeEventListener('mouseleave', disableZoom);
    };
  }, [map]);

  return null;
}

// Track map drag events
type CenterTrackerProps = {
  onDrag?: (e: LeafletEvent) => void;
  onDragEnd?: (e: DragEndEvent) => void;
};

function MapEvent(props: CenterTrackerProps) {
  useMapEvents({
    dragend: (e) => props.onDragEnd?.(e),
    drag: (e) => props.onDrag?.(e),
  });
  return null;
}
