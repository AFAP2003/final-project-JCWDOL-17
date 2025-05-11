import { useCart } from '@/context/cart-provider';
import { useLocation } from '@/context/location-provider';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { useSession } from '@/lib/auth/client';
import { CheckStockResponse } from '@/lib/types/check-stock-response';
import { GetNearestStoreResponse } from '@/lib/types/get-nearest-store.response';
import { ShippingCostResponse } from '@/lib/types/shipping-cost-response';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';

export type CheckoutPrepareErrorType =
  | 'NOT_LOGIN'
  | 'EMPTY_LOCATION'
  | 'EMPTY_CART'
  | 'NO_STORE'
  | 'ALL_PRODUCT_OUT_STOCK'
  | 'NO_COURIER_AVAILABLE';

export function usePreCheckout() {
  const [isPreparing, setIsPreparing] = useState(true);
  const { data: userLocation, isPending: locationPending } = useLocation();
  const {
    items: cartItems,
    totalItems: cartCount,
    isLoading: cartPending,
  } = useCart();
  const { data: session, isPending: sessionPending } = useSession();
  const [error, setError] = useState<CheckoutPrepareErrorType | null>(null);

  const [store, setStore] = useState<GetNearestStoreResponse['store'] | null>(
    null,
  );
  const [inStockCartItems, setInStockCartItems] = useState<typeof cartItems>(
    [],
  );
  const [outStockCartItems, setOutStockCartItems] = useState<typeof cartItems>(
    [],
  );

  const [shippings, setShippings] = useState<ShippingCostResponse['data']>([]);

  const { mutate: proccessCheckout } = useMutation({
    mutationFn: async () => {
      // get nearest store
      const { data: fetchStore } = await apiclient.get<GetNearestStoreResponse>(
        `/store/nearest?latitude=${userLocation?.latitude}&longitude=${userLocation?.longitude}`,
      );
      if (!fetchStore.store) {
        throw new Error('No store found for current user location');
      }

      // check product avaibility
      const { data: fetchStock } = await apiclient.post<CheckStockResponse>(
        `/store/product/check-stock`,
        {
          storeId: fetchStore.store.id,
          products: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      );
      if (fetchStock.outStocks.length === cartItems.length) {
        throw new Error('All product are out of stock');
      }

      const inStockCartItems = fetchStock.inStocks.map((instockId) => {
        const product = cartItems.find((item) => item.productId === instockId);
        if (!product) {
          throw new Error('Instock product id should be exist on cart items');
        }
        return product;
      });

      const outStockCartItems = fetchStock.outStocks.map((outStockId) => {
        const product = cartItems.find((item) => item.productId === outStockId);
        if (!product) {
          throw new Error('Outstock product id should be exist on cart items');
        }
        return product;
      });

      const weight =
        inStockCartItems.reduce((prev, current) => {
          return prev + (current.product.weight || 0) * current.quantity;
        }, 0) * 1000; // TODO: assume it is kg not gram, change it later
      // Get Shipping Cost
      const { data: fetchShipping } =
        await apiclient.post<ShippingCostResponse>(`/shipping/cost`, {
          origin: {
            id: fetchStore.store.postalCode
              ? fetchStore.store.postalCode
              : fetchStore.store.address,
            type: fetchStore.store.postalCode ? 'postal_code' : 'district',
          },
          destination: {
            id: userLocation?.postalCode
              ? userLocation?.postalCode
              : userLocation?.address,
            type: userLocation?.postalCode ? 'postal_code' : 'district',
          },
          weight: Math.trunc(weight),

          courier: 'jne:sicepat:jnt',
        });

      if (!fetchShipping.data.length) {
        throw new Error('No courier available');
      }

      const sortShipping = [...fetchShipping.data].sort((a, b) => {
        if (a.code === b.code) {
          return a.cost - b.cost;
        }
        return a.code.localeCompare(b.code);
      });

      return {
        store: fetchStore.store,
        inStockCartItems: inStockCartItems,
        outStockCartItems: outStockCartItems,
        shippings: sortShipping,
      };
    },

    onError: (err) => {
      if (err instanceof AxiosError) {
        const response = err.response?.data as { error: { message: string } };
        const message = response?.error?.message;

        if (
          err.status === 400 &&
          message.startsWith('Unreachable destination district')
        ) {
          setIsPreparing(false);
          setError('NO_COURIER_AVAILABLE');
          return;
        }
      }

      if (err instanceof Error) {
        if (err.message.startsWith('No store found')) {
          setIsPreparing(false);
          setError('NO_STORE');
          return;
        }

        if (err.message.startsWith('All product are out of stock')) {
          setIsPreparing(false);
          setError('ALL_PRODUCT_OUT_STOCK');
          return;
        }

        if (err.message.startsWith('No courier available')) {
          setIsPreparing(false);
          setError('NO_COURIER_AVAILABLE');
          return;
        }
      }

      toast({
        description:
          'Sorry we have problem in our server, please try again later',
        variant: 'destructive',
      });
    },

    onSuccess: (data) => {
      setStore(data.store);
      setIsPreparing(false);
      setInStockCartItems(data.inStockCartItems);
      setOutStockCartItems(data.outStockCartItems);
      setShippings(data.shippings);
    },
  });

  useEffect(() => {
    if (sessionPending || locationPending || cartPending) return;

    if (!session?.user) {
      setIsPreparing(false);
      setError('NOT_LOGIN');
    } else if (!userLocation) {
      setIsPreparing(false);
      setError('EMPTY_LOCATION');
    } else if (cartCount <= 0) {
      setIsPreparing(false);
      setError('EMPTY_CART');
    } else {
      proccessCheckout();
    }
  }, [
    cartCount,
    cartPending,
    locationPending,
    session?.user,
    sessionPending,
    userLocation,
    proccessCheckout,
  ]);

  // inStockCartItems.
  const appliedProductDiscounts: {
    itemId: string;
    discount: (typeof cartItems)[number]['product']['discounts'][number];
    discountInPrice?: number;
    discountInPercent?: number;
  }[] = [];

  inStockCartItems.forEach((item) => {
    if (!item.product.discounts.length) return;

    const discount = item.product.discounts.at(0);
    switch (discount?.type) {
      case 'BUY_X_GET_Y': {
        if (item.quantity >= discount.buyQuantity!) {
          appliedProductDiscounts.push({
            itemId: item.id,
            discount: discount,
          });
        }
        break;
      }

      case 'NO_RULES_DISCOUNT':
      case 'WITH_MAX_PRICE': {
        const subtotal = item.quantity * item.product.price;

        if (discount.minPurchase) {
          if (subtotal < discount.minPurchase) break;
        }

        let discountInPrice;
        let discountInPercent;

        if (discount.isPercentage) {
          discountInPercent = discount.value!;
          discountInPrice = (discount.value! / 100) * subtotal;
          if (discountInPrice > discount.maxDiscount!) {
            discountInPrice = discount.maxDiscount;
          }
        } else {
          discountInPrice = discount.value!;
          discountInPercent = (discount.value! / subtotal) * 100;
        }
        appliedProductDiscounts.push({
          itemId: item.id,
          discount: discount,
          discountInPercent,
          discountInPrice,
        });
      }
    }
  });

  return {
    isPreparing,
    error,
    store: store as NonNullable<GetNearestStoreResponse['store']>,
    inStockCartItems,
    appliedProductDiscounts,
    outStockCartItems,
    shippings,
    destination: userLocation,
  };
}
