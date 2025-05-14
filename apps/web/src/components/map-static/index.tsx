'use client';

import { IDN_LATLONG_BOUND } from '@/lib/constants/indonesian-latlong-bounds';
import { cn } from '@/lib/utils';
import {
  divIcon,
  DragEndEvent,
  LeafletEvent,
  Map as LeafletMap,
} from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

type Props = {
  position: {
    lat: number;
    lng: number;
  };
  className?: string;
};

export default function MapStatic(props: Props) {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const markerIcon = useMemo(() => MarkerIcon(), []);
  const handleMapRef = useCallback((map: LeafletMap) => {
    setMap(map);
  }, []);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg relative w-full aspect-video',
        props.className,
      )}
    >
      <MapContainer
        center={props.position}
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

        <Marker position={props.position} icon={markerIcon} />

        <ScrollWheelToggleOnHover />
        <FullscreenControl />
        <MapRefSetter setMapRef={handleMapRef} />
      </MapContainer>
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
