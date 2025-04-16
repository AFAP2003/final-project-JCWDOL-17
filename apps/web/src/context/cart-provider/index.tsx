'use client';

import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { createContext, useContext, useEffect, useState } from 'react';

// Pindahin
export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    description?: string;
    images: { imageUrl: string; isMain: boolean };
  };
};

type CartContextType = {
  items: CartItem[];
  isLoading: boolean;
  error: Error | null;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  totalItems: number;
  subtotal: number;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshCart = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiclient.get('/cart');
      setItems(data.items || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const addToCart = async (productId: string, quantity: number) => {
    try {
      setIsLoading(true);
      await apiclient.post('/cart/items', { productId, quantity });
      toast({
        description: 'Item added to cart',
      });
      await refreshCart();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        description:
          err.response?.data?.error?.message || 'Failed to add item to cart',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      setIsLoading(true);
      await apiclient.put(`/cart/items/${itemId}`, { quantity });
      await refreshCart();
    } catch (err: any) {
      console.error('Error updating cart item:', err);
      toast({
        variant: 'destructive',
        description:
          err.response?.data?.error?.message || 'Failed to update item in cart',
      });
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setIsLoading(true);
      await apiclient.delete(`/cart/items/${itemId}`);
      toast({
        description: 'Item removed from cart',
      });
      await refreshCart();
    } catch (err: any) {
      console.error('Error removing from cart:', err);
      toast({
        variant: 'destructive',
        description:
          err.response?.data?.error?.message ||
          'Failed to remove item from cart',
      });
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        error,
        addToCart,
        updateCartItem,
        removeFromCart,
        totalItems,
        subtotal,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
