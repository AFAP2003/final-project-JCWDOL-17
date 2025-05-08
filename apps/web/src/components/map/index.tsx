'use client';

/* eslint-disable react-hooks/exhaustive-deps */
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { apiclient } from '@/lib/apiclient';
import { IDN_LATLONG_BOUND } from '@/lib/constants/indonesian-latlong-bounds';
import { GeocodingResponse } from '@/lib/types/geocoding-response';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  divIcon,
  DragEndEvent,
  LeafletEvent,
  Map as LeafletMap,
} from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import qs from 'query-string';
import { toast } from '@/hooks/use-toast';

type Props = {
  initialPosition: {
    lat: number;
    lng: number;
  };
  onLocationChange: (loc: GeocodingResponse[number] | null) => void;
};

export default function Map(props: Props) {
  const [map, setMap] = useState<LeafletMap | null>(null);

  const [markerPosition, setMarkerPosition] = useState(props.initialPosition);
  const [dbMarkerPosition] = useDebounceValue(markerPosition, 1500);

  const [inputSearch, setInputSearch] = useState('');
  const [dbInputSearch] = useDebounceValue(inputSearch, 500);
  const [resultSearch, setResultSearch] = useState<GeocodingResponse>([]);

  const [pinnedLocation, setPinnedLocation] = useState<
    GeocodingResponse[number] | null
  >(null);

  const [isInitial, setIsInitial] = useState(true);
  const [isAfterSearch, setIsAfterSearch] = useState(false);

  const { mutate: fetchLocation, isPending } = useMutation({
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
        variant: 'destructive',
        title: 'Error fetching location',
        description: 'Please try again or enter your address manually.',
      });
    },
  });

  // Get location by coordinates when map marker is moved
  useEffect(() => {
    if (isAfterSearch) return;

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
          if (isInitial) setIsInitial(false);
        },
      },
    );
  }, [dbMarkerPosition]);

  // Get location results when user searches
  useEffect(() => {
    if (isInitial || !dbInputSearch.trim()) return;

    fetchLocation(
      {
        name: dbInputSearch,
        resultSize: 5,
      },
      {
        onSuccess: (data) => {
          setResultSearch(data);
        },
      },
    );
  }, [dbInputSearch]);

  // Pass location changes to parent component
  useEffect(() => {
    props.onLocationChange(pinnedLocation);
  }, [pinnedLocation]);

  return (
    <div className="overflow-hidden rounded-lg relative w-full aspect-video">
      <MapContainer
        center={props.initialPosition}
        zoom={16}
        scrollWheelZoom={false}
        maxBounds={IDN_LATLONG_BOUND}
        maxBoundsViscosity={1.0}
        wheelPxPerZoomLevel={1000}
        style={{ borderRadius: '0.5rem' }}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={markerPosition} icon={MarkerIcon()} />

        <MapEvent
          onDrag={(e) => {
            const center = e.target.getCenter();
            setMarkerPosition({
              lat: center.lat,
              lng: center.lng,
            });
            if (isAfterSearch === true) setIsAfterSearch(false);
          }}
        />
        <ScrollWheelToggleOnHover />
        <FullscreenControl />
        <MapRefSetter setMapRef={setMap} />
      </MapContainer>

      {/* Search */}
      <div
        className="absolute right-6 top-3 bg-neutral-50 w-full max-w-sm overflow-hidden border-[1.8px] rounded-lg shadow-sm group border-neutral-500"
        style={{ zIndex: 1000 }}
      >
        <div className="relative flex items-center w-full px-2">
          <Search className="text-neutral-500 shrink-0" />
          <Input
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value.trim())}
            className="focus-visible:ring-0 shadow-none border-none text-neutral-700"
            placeholder="Search for location"
          />
          {isPending && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          )}
        </div>

        {resultSearch.length > 0 && (
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

                      setMarkerPosition({
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
                    className="text-left text-xs pb-1 hover:bg-neutral-200 rounded-lg px-2 w-full"
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

        {/* Location verification display */}
        {pinnedLocation && (
          <div className="bg-blue-50 p-2 text-xs">
            <p className="font-medium">Selected Location:</p>
            <p>{pinnedLocation.name}</p>
            <p className="text-gray-600 text-xs">{pinnedLocation.address}</p>
            <p className="text-gray-500 text-xs mt-1">
              Coordinates: {pinnedLocation.latitude.toFixed(6)},{' '}
              {pinnedLocation.longitude.toFixed(6)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom Marker Icon
function MarkerIcon() {
  return divIcon({
    className: 'marker-icon',
    html: `<div class="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
      <div class="w-2 h-2 bg-white rounded-full"></div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function MapRefSetter({ setMapRef }: { setMapRef: (map: LeafletMap) => void }) {
  const map = useMap();
  useEffect(() => {
    setMapRef(map);
  }, [map, setMapRef]);
  return null;
}

// Enable scroll zoom only on hover
function ScrollWheelToggleOnHover() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const enableZoom = () => map.scrollWheelZoom.enable();
    const disableZoom = () => map.scrollWheelZoom.disable();

    container.addEventListener('mouseenter', enableZoom);
    container.addEventListener('mouseleave', disableZoom);

    map.scrollWheelZoom.disable(); // Disable initially

    return () => {
      container.removeEventListener('mouseenter', enableZoom);
      container.removeEventListener('mouseleave', disableZoom);
    };
  }, [map]);

  return null;
}

// Track center position on map move
type CenterTrackerProps = {
  onDrag?: (e: LeafletEvent) => void;
  onDragEnd?: (e: DragEndEvent) => void;
};

function MapEvent(props: CenterTrackerProps) {
  useMapEvents({
    dragend: (e) => {
      if (props.onDragEnd) props.onDragEnd(e);
    },
    drag: (e) => {
      if (props.onDrag) props.onDrag(e);
    },
  });

  return null;
}
