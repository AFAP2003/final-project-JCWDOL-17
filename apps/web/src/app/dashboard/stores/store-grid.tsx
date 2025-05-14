'use client';

import StoreCard from './store-card';

interface StoreGridProps {
  stores: Array<{
    id: string;
    name: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    isMain: boolean;
    isActive: boolean;
    admin: {
      name: string;
      email: string;
      image?: string;
    };
  }>;
}

export default function StoreGrid({ stores }: StoreGridProps) {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
      {stores.map((store, index) => (
        <StoreCard key={store.id} store={store} index={index} />
      ))}
    </div>
  );
}
