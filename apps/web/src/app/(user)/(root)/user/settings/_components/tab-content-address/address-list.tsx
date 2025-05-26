import { useState } from 'react';
import AddressCard from './address-card';
import PaginationState from './pagination-state';

type Address = {
  id: string;
  isDefault: boolean;
  label: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  recipient: string;
  phone: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

type Props = {
  addresses: Address[];
  pageSize: number;
  disabled: boolean;
  onEdit: (address: Address) => void;
  onDelete: (address: Address) => void;
};

export default function AddressList({
  addresses,
  pageSize,
  disabled,
  onEdit,
  onDelete,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(addresses.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentAddresses = addresses.slice(startIndex, startIndex + pageSize);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="flex flex-col gap-y-6 justify-between">
      <div className="space-y-6">
        {currentAddresses.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            disabled={disabled}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <PaginationState
        className="mt-auto"
        metadata={{
          currentPage: currentPage,
          firstPage: 1,
          lastPage: totalPages,
          pageSize: pageSize,
          totalRecord: addresses.length,
        }}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </div>
  );
}
