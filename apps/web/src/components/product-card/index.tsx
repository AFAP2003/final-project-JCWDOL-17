import { formatCurrency } from '@/lib/utils';
import { ShoppingBasket } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';

type Props = {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    weight?: number;
    sku: string;
    categoryId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    category: {
      id: string;
      name: string;
      description?: string;
      image?: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
    images: {
      id: string;
      productId: string;
      imageUrl: string;
      isMain: boolean;
      createdAt: Date;
    }[];
    discounts: {
      id: string;
      storeId: string;
      name: string;
      description?: string;
      type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y';
      value: number;
      minPurchase?: number;
      maxDiscount?: number;
      startDate: Date;
      endDate: Date;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      buyQuantity?: number;
      getQuantity?: number;
    }[];
  };
};

export default function ProductCard({ product }: Props) {
  const images = product.images;

  return (
    <div className="p-1.5 bg-neutral-200 shadow rounded-lg border border-neutral-200 group/container hover:cursor-pointer">
      <div className="bg-neutral-50 rounded-md overflow-hidden">
        <div className="rounded-lg">
          {/* TODO: IMAGE handle isMain image */}
          {images.length > 1 ? (
            <div className="group/image relative aspect-square">
              <Image
                src={images[0].imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
              <Image
                src={images[1].imageUrl}
                alt={product.name}
                fill
                className="object-cover absolute opacity-0 group-hover/image:opacity-100 transition-all duration-500 "
              />
            </div>
          ) : (
            <div className="group relative aspect-square">
              <Image src={product.images[0].imageUrl} alt={product.name} fill />
            </div>
          )}
        </div>

        {/* DETAIL */}
        <div className="p-3 text-neutral-700 font-semibold">
          <h3 className="mb-2 line-clamp-1">{product.name}</h3>
          <p className="mb-2 text-sm text-neutral-500 line-clamp-2">
            {product.description}
          </p>

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {formatCurrency(product.price)}
              </span>
            </div>
          </div>

          <Button className="w-full bg-neutral-800">
            <ShoppingBasket className="size-12" />
            Tambahkan
          </Button>
        </div>
      </div>
    </div>
  );
}
