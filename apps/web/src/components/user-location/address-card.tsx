import { GetAllAddressResponse } from '@/lib/types/get-all-address-response';

type Props = {
  address: GetAllAddressResponse['addresses'][number];
  onClick: (address: GetAllAddressResponse['addresses'][number]) => void;
};

export default function AddressCard({ address, onClick }: Props) {
  return (
    <div
      className="hover:bg-neutral-700 cursor-pointer transition-all rounded-md py-3 px-3"
      onClick={() => onClick(address)}
    >
      <div className="transition-all">
        <div>
          <h3>{address.label}</h3>
        </div>
        <div className="text-sm">
          <div>
            {address.recipient} - {address.phone}
          </div>
          <div>{address.address}</div>
          <div>
            {address.city}, {address.city} | {address.postalCode}
          </div>
        </div>
      </div>
    </div>
  );
}
