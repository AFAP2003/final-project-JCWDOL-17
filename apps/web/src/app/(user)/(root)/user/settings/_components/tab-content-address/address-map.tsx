'use client';

/* eslint-disable react-hooks/exhaustive-deps */
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
// import { apiclient } from '@/lib/apiclient';
import { IDN_LATLONG_BOUND } from '@/lib/constants/indonesian-latlong-bounds';
import { FindLocationResponse } from '@/lib/types/find-location-response';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { divIcon, DragEndEvent, LeafletEvent, Map } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search } from 'lucide-react';
// import qs from 'query-string';
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

type Props = {
  initialPosition: {
    lat: number;
    lng: number;
  };
  onLocationChange: (loc: FindLocationResponse[number] | null) => void;
};

export default function AddressMap(props: Props) {
  const [map, setMap] = useState<Map | null>(null);

  const [markerPosition, setMarkerPosition] = useState(props.initialPosition);
  const [dbMarkerPosition] = useDebounceValue(markerPosition, 1500);

  const [inputSearch, setInputSearch] = useState('');
  const [dbInputSearch] = useDebounceValue(inputSearch, 500);
  const [resultSearch, setResultSearch] = useState<FindLocationResponse>([]);

  const [pinnedLocation, setPinnedLocation] = useState<
    FindLocationResponse[number] | null
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
      // const query = qs.stringify(param, {
      //   skipNull: true,
      //   skipEmptyString: true,
      // });
      // const { data } = await apiclient.get(`/region/geo-places?${query}`);
      // return data as FindLocationResponse;
      return DummyFetch(param);
    },

    onError: (error: AxiosError) => {
      // TODO:
    },
  });

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

  useEffect(() => {
    if (isInitial) return;

    fetchLocation(
      {
        name: inputSearch,
        resultSize: 5,
      },
      {
        onSuccess: (data) => {
          setResultSearch(data);
        },
      },
    );
  }, [dbInputSearch]);

  useEffect(() => {
    // if (isInitial) return;
    props.onLocationChange(pinnedLocation);
  }, [pinnedLocation]);

  return (
    <div className="relative border-neutral-500 border-2 p-2 py-3 rounded-lg shadow-md">
      <h3 className="pb-6 pt-3 px-3 font-medium">Pintpoint Your Address</h3>

      <div className="overflow-hidden rounded-lg relative px-3">
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
          className="absolute right-6 top-3 bg-white w-full max-w-sm overflow-hidden border-[1.8px] rounded-lg shadow-sm group border-neutral-500"
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
        </div>

        {/* Location Result */}
        {pinnedLocation && (
          <div className="pt-6 pb-3">
            <p className="font-medium text-neutral-200 pb-1.5">
              {pinnedLocation.name}
            </p>
            <p className="text-sm text-neutral-300">{pinnedLocation.address}</p>
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
    html: `<div class="marker-shadow"></div>`,
    iconSize: [50, 50],
  });
}

function MapRefSetter({ setMapRef }: { setMapRef: (map: Map) => void }) {
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

function DummyFetch(param: {
  name?: string;
  lat?: number;
  lng?: number;
  resultSize: number;
}) {
  if (!param.name && !param.lat && !param.lng) return [];
  const places = [
    {
      name: 'Jalan Karangrejo Tengah',
      address:
        'Jl. Karangrejo Tengah, Karangrejo, Kec. Gajahmungkur, Kota Semarang, Jawa Tengah 50231, Indonesia',
      latitude: -7.027455,
      longitude: 110.4134411,
    },
    {
      name: 'Karangrejo',
      address:
        'Karangrejo, Kec. Gajahmungkur, Kota Semarang, Jawa Tengah, Indonesia',
      latitude: -7.025345799999999,
      longitude: 110.4128027,
    },
    {
      name: 'Karangrejo',
      address:
        'Karangrejo, Kec. Grobogan, Kabupaten Grobogan, Jawa Tengah, Indonesia',
      latitude: -7.010573,
      longitude: 110.9298005,
    },
    {
      name: 'Karangrejo',
      address:
        'Karangrejo, Kecamatan Gabus, Kabupaten Grobogan, Jawa Tengah, Indonesia',
      latitude: -7.1273304,
      longitude: 111.1950767,
    },
  ];
  return places;
}
