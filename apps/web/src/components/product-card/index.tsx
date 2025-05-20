import { useCart } from '@/context/cart-provider';
import { toast } from '@/hooks/use-toast';
import { useSession } from '@/lib/auth/client';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBasket } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import LoginDialog from '../login-dialog';
import { Badge } from '../ui/badge';
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
    createdAt: string;
    updatedAt: string;
    category: {
      id: string;
      name: string;
      description?: string;
      image?: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
    images: {
      id: string;
      productId: string;
      imageUrl: string;
      isMain: boolean;
      createdAt: string;
    }[];
    discounts: {
      id: string;
      storeId: string;
      name: string;
      description?: string;
      type: 'NO_RULES_DISCOUNT' | 'WITH_MAX_PRICE' | 'BUY_X_GET_Y';
      value?: number; // WITH_MAX_PRICE / BUY_X_GET_X
      isPercentage?: boolean; // WITH_MAX_PRICE / BUY_X_GET_X
      maxDiscount?: number; // requeired if value is percentage
      minPurchase?: number; // WITH_MAX_PRICE
      buyQuantity?: number; // BUY_X_GET_X
      getQuantity?: number; // BUY_X_GET_X
      startDate: string;
      endDate: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    }[];
  };
};

export default function ProductCard({ product }: Props) {
  const images = product.images;
  const discount = product.discounts.at(0);
  const { items, addToCart, updateCartItem, isLoading } = useCart();
  const { data: session, isPending } = useSession();
  const [loginDialog, setLoginDialog] = useState(false);

  const handleAddToCart = () => {
    if (isPending || isLoading) return;
    if (!session) {
      setLoginDialog(true);
      return;
    }

    const item = items.find((item) => item.productId === product.id);
    if (item) {
      updateCartItem(item.id, item.quantity + 1);
    } else {
      addToCart(product.id, 1);
    }
    toast({
      description: 'Item added to cart',
    });
  };

  return (
    <>
      <div className="p-1.5 bg-neutral-100 shadow rounded-lg border border-neutral-100 group/container">
        <Link
          href={`/product/${product.id}`}
          className="bg-neutral-50 rounded-md overflow-hidden flex flex-col size-full hover:cursor-pointer"
        >
          <div className="rounded-lg relative">
            {/* TODO: IMAGE handle isMain image */}
            {images.length > 1 ? (
              <div className="group/image relative aspect-square">
                <Image
                  src={images.at(0)?.imageUrl || ''}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                <Image
                  src={images.at(1)?.imageUrl || ''}
                  alt={product.name}
                  fill
                  className="object-cover absolute opacity-0 group-hover/image:opacity-100 transition-all duration-300 "
                />
              </div>
            ) : (
              <div className="group/image relative aspect-square">
                <Image
                  src={images.at(0)?.imageUrl || ''}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {discount && (
              <div className="absolute top-1 left-1">
                <Badge className="text-xs bg-red-600 hover:bg-red-600">
                  {discount.name}
                </Badge>
              </div>
            )}
          </div>

          {/* DETAIL */}
          <div className="p-3 text-neutral-700 font-semibold h-full flex flex-col">
            <div className="mb-3 space-y-1">
              <h3 className="line-clamp-1">{product.name}</h3>
              <p className="text-sm text-neutral-500 line-clamp-2">
                {product.description}
              </p>
            </div>

            <div className="mb-4 grow">
              <Price price={product.price} discount={discount} />
            </div>

            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart();
              }}
              className="w-full bg-neutral-800 hover:bg-neutral-800/95 text-neutral-100 hover:text-neutral-200 disabled:opacity-90"
            >
              <ShoppingBasket className="size-12" />
              Tambahkan
            </Button>
          </div>
        </Link>
      </div>

      <LoginDialog
        open={loginDialog}
        onOpenChange={setLoginDialog}
        onCancel={() => setLoginDialog(false)}
      />
    </>
  );
}

type PriceProps = {
  price: number;
  discount?: {
    id: string;
    storeId: string;
    name: string;
    description?: string;
    type: 'NO_RULES_DISCOUNT' | 'WITH_MAX_PRICE' | 'BUY_X_GET_Y';
    value?: number;
    isPercentage?: boolean;
    minPurchase?: number;
    maxDiscount?: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    buyQuantity?: number;
    getQuantity?: number;
  };
};

function Price(prop: PriceProps) {
  if (!prop.discount) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center mb-1">
          <span className="font-semibold">{formatCurrency(prop.price)}</span>
        </div>
        <div className="text-transparent text-xs">placeholder</div>
      </div>
    );
  }

  switch (prop.discount.type) {
    case 'BUY_X_GET_Y': {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center mb-1">
            <span className="font-semibold">{formatCurrency(prop.price)}</span>
          </div>
          <div className="text-red-500 text-xs">
            +{prop.discount.getQuantity} Free
          </div>
        </div>
      );
    }
    case 'WITH_MAX_PRICE': {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center mb-1">
            <span className="font-semibold">{formatCurrency(prop.price)}</span>
          </div>
          <div className="text-red-500 text-xs">Special Offer</div>
        </div>
      );
    }
    case 'NO_RULES_DISCOUNT': {
      const priceAfter = prop.discount.isPercentage
        ? prop.price - (prop.discount.value! / 100) * prop.price
        : prop.price - prop.discount.value!;

      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center mb-1 gap-1.5">
            <span className="font-semibold line-through text-neutral-400">
              {formatCurrency(prop.price)}
            </span>
            <span className="font-semibold">{formatCurrency(priceAfter)}</span>
          </div>
          <div className="text-red-500 text-xs">
            {prop.discount.isPercentage
              ? `-${prop.discount.value}% Off`
              : `-${formatCurrency(prop.discount.value!)}`}
          </div>
        </div>
      );
    }
  }
}
