'use client';

import LoginDialog from '@/components/login-dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/cart-provider';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { useSession } from '@/lib/auth/client';
import { dateFrom } from '@/lib/datetime';
import { GetProductByIdResponse } from '@/lib/types/get-product-by-id-response';
import { cn, formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id as Indo } from 'date-fns/locale';
import { ImageIcon, MinusIcon, PlusIcon, ShoppingBasket } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import 'swiper/css/bundle';
import { Mousewheel, Scrollbar } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useMediaQuery } from 'usehooks-ts';
import ContentSkeleton from './content-skeleton';

type Props = {
  productId: string;
};

export default function ProductInfo({ productId }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [count, setCount] = useState(1);
  const { data: session, isPending: isSessionPending } = useSession();
  const {
    items,
    addToCart,
    updateCartItem,
    isLoading: cartLoading,
  } = useCart();
  const [loginDialog, setLoginDialog] = useState(false);

  const handleAddToCart = () => {
    if (isSessionPending || cartLoading) return;
    if (!session) {
      setLoginDialog(true);
      return;
    }

    const item = items.find((item) => item.productId === productId);
    if (item) {
      updateCartItem(item.id, item.quantity + count);
    } else {
      addToCart(productId, count);
    }
    toast({
      description: `${count} item(s) added to cart`,
    });
  };

  const isSuperSmall = useMediaQuery('(max-width: 480px)');

  const {
    data,
    isPending: isGetProductPending,
    error,
  } = useQuery({
    queryKey: ['getbyid:product', productId],
    queryFn: async () => {
      const { data } = await apiclient.get(`/product/${productId}`);
      return data as GetProductByIdResponse;
    },
  });

  useEffect(() => {
    setSelectedImage(data?.images.at(0)?.imageUrl);
  }, [data]);

  if (error) {
    toast({
      description:
        'Sorry we have problem in our server, please try again later',
      variant: 'destructive',
    });
  }

  if (isGetProductPending) {
    return <ContentSkeleton />;
  }

  const discount = data?.discounts.at(0);

  return (
    <>
      <div className="bg-neutral-50 shadow p-9 rounded-md border border-neutral-100">
        <div className="flex gap-12 w-full max-lg:flex-col">
          {/* Image */}
          <div className="w-full">
            <div className="md:min-w-[480px] max-w-[580px] mx-auto">
              <div className="relative w-full aspect-square rounded-md overflow-hidden bg-neutral-100 border border-neutral-200">
                {selectedImage ? (
                  <Image src={selectedImage} alt="Produk Image" fill />
                ) : (
                  <div className="absolute size-full flex justify-center items-center">
                    <p className="text-lg text-neutral-500 flex flex-col justify-center items-center">
                      <span>Produk Image</span>
                      <ImageIcon className="text-neutral-400" />
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detail */}
          <div className="text-neutral-700 w-full h-full">
            <div className="space-y-3">
              <Badge className="text-xs lg:text-sm bg-neutral-800 text-neutral-200 w-fit">
                {data?.category.name}
              </Badge>
              <h3 className="text-xl lg:text-2xl font-semibold">
                {data?.name}
              </h3>
            </div>

            <Separator className="my-6" />

            <div className="p-6 bg-neutral-100 rounded-md">
              <Price price={data?.price!} discount={discount} />
            </div>

            <Separator className="my-6" />

            <div className="">
              <Swiper
                className="horizontal-scroll cursor-grab"
                modules={[Mousewheel, Scrollbar]}
                mousewheel={true}
                slidesPerView={5}
                breakpoints={{
                  0: {
                    slidesPerView: 2,
                  },
                  380: {
                    slidesPerView: 3,
                  },
                  480: {
                    slidesPerView: 4,
                  },
                  580: {
                    slidesPerView: 5,
                  },
                  680: {
                    slidesPerView: 6,
                  },
                  780: {
                    slidesPerView: 7,
                  },
                  880: {
                    slidesPerView: 8,
                  },
                  1020: {
                    slidesPerView: 4,
                  },
                  1100: {
                    slidesPerView: 5,
                  },
                  1280: {
                    slidesPerView: 6,
                  },
                }}
              >
                {data?.images.map((image, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="w-full flex items-center justify-center">
                      <div
                        onClick={(e) => {
                          setSelectedImage(image.imageUrl);
                        }}
                        className="relative aspect-square size-20 flex items-center justify-center bg-neutral-200 rounded-md overflow-hidden cursor-pointer border border-transparent hover:border-neutral-300"
                      >
                        <Image src={image.imageUrl} alt="Produk Image" fill />
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="my-6" />

            <Accordion type="single" collapsible className="w-full mb-12">
              {discount && (
                <AccordionItem value="promo">
                  <AccordionTrigger className="text-sm sm:text-base">
                    Promo
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-red-500 font-medium">{discount.name}</p>
                    <p className="text-neutral-500">{discount.description}</p>
                    <p className="text-red-500">
                      Berlaku sampai{' '}
                      <span>
                        {format(dateFrom(discount.endDate), 'd MMMM, yyyy', {
                          locale: Indo,
                        })}
                      </span>
                    </p>
                  </AccordionContent>
                </AccordionItem>
              )}
              <AccordionItem value="description">
                <AccordionTrigger className="text-sm sm:text-base">
                  Deskripsi Produk
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-500">{data?.description}</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="info">
                <AccordionTrigger className="text-sm sm:text-base">
                  Informasi Produk
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <DataGrid label="SKU" value={data?.sku!} />
                    <DataGrid label="Weight" value={`${data?.weight!} Kg`} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'font-medium sm:text-base text-sm',
                    isSuperSmall && 'hidden',
                  )}
                >
                  Quantity
                </span>
                <div
                  className={cn(
                    'flex items-center border border-neutral-300 rounded-md overflow-hidden',
                    isSuperSmall && 'w-full justify-between',
                  )}
                >
                  <button
                    onClick={() => setCount((prev) => Math.max(1, prev - 1))}
                    className="p-1 sm:p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                  >
                    <MinusIcon className="size-full" />
                  </button>
                  <span className="px-4 p-1 sm:py-2 min-w-[50px] text-center">
                    {count}
                  </span>
                  <button
                    onClick={() => setCount((prev) => prev + 1)}
                    className="p-1 sm:p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                  >
                    <PlusIcon />
                  </button>
                </div>
              </div>

              <button
                className="w-full flex items-center justify-center gap-3 bg-neutral-800 p-3 rounded-md text-neutral-200 disabled:opacity-90 sm:text-base text-sm"
                disabled={count <= 0 || isSessionPending || cartLoading}
                onClick={() => {
                  if (count > 0) {
                    handleAddToCart();
                  }
                }}
              >
                <ShoppingBasket className="max-[480px]:hidden" />{' '}
                {isSuperSmall ? 'Tambahkan' : `Tambahkan Keranjang (${count})}`}
              </button>
            </div>
          </div>
        </div>
      </div>

      <LoginDialog
        open={loginDialog}
        onOpenChange={setLoginDialog}
        onCancel={() => setLoginDialog(false)}
      />
    </>
  );
}

type DataGridParam = {
  label: string;
  value: string | number;
};

function DataGrid(param: DataGridParam) {
  return (
    <div className="grid grid-cols-2 max-w-sm">
      <div className="font-medium text-neutral-500">{param.label}</div>

      <div className="text-neutral-500">{param.value}</div>
    </div>
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
      <div className="flex gap-3 items-center">
        <div className="flex items-center text-xl lg:text-2xl">
          <span className="font-semibold">{formatCurrency(prop.price)}</span>
        </div>
      </div>
    );
  }

  switch (prop.discount.type) {
    case 'BUY_X_GET_Y': {
      return (
        <div className="flex flex-col min-[480px]:flex-row gap-1 min-[480px]:gap-3 items-center h-full">
          <div className="flex items-center">
            <span className="font-semibold text-xl lg:text-2xl">
              {formatCurrency(prop.price)}
            </span>
          </div>
          <div className="text-red-500 text-xs min-[480px]:text-sm">
            +{prop.discount.getQuantity} Free
          </div>
        </div>
      );
    }
    case 'WITH_MAX_PRICE': {
      return (
        <div className="flex flex-col min-[480px]:flex-row gap-1 min-[480px]:gap-3 items-center h-full">
          <div className="flex items-center">
            <span className="font-semibold text-xl lg:text-2xl">
              {formatCurrency(prop.price)}
            </span>
          </div>
          <div className="text-red-500 text-xs min-[480px]:text-sm">
            Special Offer
          </div>
        </div>
      );
    }
    case 'NO_RULES_DISCOUNT': {
      const priceAfter = prop.discount.isPercentage
        ? prop.price - (prop.discount.value! / 100) * prop.price
        : prop.price - prop.discount.value!;

      return (
        <div className="flex flex-col min-[480px]:flex-row gap-1 min-[480px]:gap-3 items-center h-full">
          <div className="flex flex-col min-[480px]:flex-row items-center gap-1 min-[480px]:gap-3">
            <span className="font-semibold text-xl lg:text-2xl">
              {formatCurrency(priceAfter)}
            </span>
            <span className="font-semibold text-xl lg:text-2xl line-through text-neutral-400">
              {formatCurrency(prop.price)}
            </span>
          </div>
          <div className="text-red-500 text-xs min-[480px]:text-sm">
            {prop.discount.isPercentage
              ? `-${prop.discount.value}% Off`
              : `-${formatCurrency(prop.discount.value!)}`}
          </div>
        </div>
      );
    }
  }
}
