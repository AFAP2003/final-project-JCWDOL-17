import { GetAllAddressResponse } from '@/lib/types/get-all-address-response';
import { HomeIcon, Star } from 'lucide-react';

type Props = {
  address: GetAllAddressResponse['addresses'][number];
  onClick: (address: GetAllAddressResponse['addresses'][number]) => void;
};

export default function AddressCard({ address, onClick }: Props) {
  return (
    <div
      className="cursor-pointer transition-all rounded-xl border border-neutral-700 bg-neutral-800 p-6 hover:border-neutral-500"
      onClick={() => onClick(address)}
    >
      <div className="flex items-start gap-4">
        <div className="text-neutral-300 mt-1">
          <HomeIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">
              {address.label}
            </h3>
            {address.isDefault && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-500 text-black font-medium">
                <Star className="w-3.5 h-3.5" />
                Alamat Utama
              </span>
            )}
          </div>
          <div className="text-sm text-neutral-400 leading-relaxed">
            <p>
              {address.recipient} — {address.phone}
            </p>
            <p>{address.address}</p>
            <p>
              {address.city}, {address.province} — {address.postalCode}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
