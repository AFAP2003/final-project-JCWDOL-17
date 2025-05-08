import { useCart } from '@/context/cart-provider';
import { useLocation } from '@/context/location-provider';
import { apiclient } from '@/lib/apiclient';
import { useSession } from '@/lib/auth/client';
import { CheckStockResponse } from '@/lib/types/check-stock-response';
import { GetNearestStoreResponse } from '@/lib/types/get-nearest-store.response';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';

export type CheckoutErrorType =
  | 'NOT_LOGIN'
  | 'EMPTY_LOCATION'
  | 'EMPTY_CART'
  | 'NO_STORE'
  | 'ALL_PRODUCT_OUT_STOCK';

export function useCheckout() {
  const [isPreparing, setIsPreparing] = useState(true);
  const { data: userLocation, isPending: locationPending } = useLocation();
  const {
    items: cartItems,
    totalItems: cartCount,
    isLoading: cartPending,
  } = useCart();
  const { data: session, isPending: sessionPending } = useSession();
  const [error, setError] = useState<{
    type: CheckoutErrorType;
    description?: string;
  } | null>(null);

  const [store, setStore] = useState<GetNearestStoreResponse['store'] | null>(
    null,
  );
  const [inStockCartItems, setInStockCartItems] = useState<typeof cartItems>();
  const [outStockCartItems, setOutStockCartItems] =
    useState<typeof cartItems>();

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

      return {
        store: fetchStore.store,
        inStockCartItems: inStockCartItems,
        outStockCartItems: outStockCartItems,
      };
    },

    onError: (err) => {
      if (err instanceof AxiosError) {
        return;
      }

      if (err instanceof Error) {
        if (err.message.startsWith('No store found')) {
          setIsPreparing(false);
          setError({ type: 'NO_STORE' });
          return;
        }

        if (err.message.startsWith('All product are out of stock')) {
          setIsPreparing(false);
          setError({ type: 'ALL_PRODUCT_OUT_STOCK' });
          return;
        }
      }
    },

    onSuccess: (data) => {
      setStore(data.store);
      setIsPreparing(false);
      setInStockCartItems(data.inStockCartItems);
      setOutStockCartItems(data.outStockCartItems);
    },
  });

  useEffect(() => {
    if (sessionPending || locationPending || cartPending) return;

    if (!session?.user) {
      setIsPreparing(false);
      setError({ type: 'NOT_LOGIN' });
    } else if (!userLocation) {
      setIsPreparing(false);
      setError({ type: 'EMPTY_LOCATION' });
    } else if (cartCount <= 0) {
      setIsPreparing(false);
      setError({ type: 'EMPTY_CART' });
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

  return { isPreparing, error, store, inStockCartItems, outStockCartItems };
}
