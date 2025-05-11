import { LocationType } from '@/lib/types/location-type';
import { MapPinCheck } from 'lucide-react';

type Props = {
  location: LocationType;
};

export default function SelectedLocation({ location }: Props) {
  return (
    <div className="mb-6">
      {location ? (
        <div className="flex w-full items-start gap-4 p-4 rounded-xl border border-neutral-700 shadow-sm">
          <div className="text-red-500 bg-neutral-700/30 p-2 rounded-full">
            <MapPinCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium text-white">{location.label}</p>
            <p className="text-sm text-neutral-400">{location.address}</p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-neutral-800 border border-neutral-700 text-base text-neutral-400">
          Tidak ada lokasi yang dipilih.
        </div>
      )}
    </div>
  );
}
