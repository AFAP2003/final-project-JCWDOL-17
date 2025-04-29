import { GetAllAddressResponse } from '@/lib/types/get-all-address-response';

type Props = {
  address: GetAllAddressResponse['addresses'][number];
  onClick: (address: GetAllAddressResponse['addresses'][number]) => void;
};

export default function AddressCard({ address, onClick }: Props) {
  return (
    <div
      className="hover:bg-neutral-700 cursor-pointer transition-all rounded-md py-3 px-3 hover:px-6"
      onClick={() => onClick(address)}
    >
      <div className="transition-all">
        <div className="mb-1.5">
          <h3>{address.label}</h3>
        </div>
        <div className="text-sm text-neutral-300 flex gap-3 size-full">
          <div className="bg-neutral-500 grow max-w-[2px]"></div>
          <div className="grow">
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
    </div>
  );
}
