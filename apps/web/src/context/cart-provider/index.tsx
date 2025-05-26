'use client';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { useSession } from '@/lib/auth/client';
import { GetCartResponse } from '@/lib/types/get-cart-response';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type CartItem = GetCartResponse['items'][number];

type CartContextType = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType>({
  items: [],
  totalItems: 0,
  subtotal: 0,
  isLoading: false,
  addToCart: async () => {},
  updateCartItem: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  refreshCart: async () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  const fetchCart = async () => {
    if (!session?.user) {
      setItems([]);
      setTotalItems(0);
      setSubtotal(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await apiclient.get('/cart');

      setItems(data.items || []);
      setTotalItems(
        data.items.reduce(
          (sum: number, item: CartItem) => sum + item.quantity,
          0,
        ),
      );
      setSubtotal(
        data.items.reduce(
          (sum: number, item: CartItem) =>
            sum + item.product.price * item.quantity,
          0,
        ),
      );
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast({
        description: 'Failed to load your cart',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchCart();
    } else {
      setItems([]);
      setTotalItems(0);
      setSubtotal(0);
      setIsLoading(false);
    }
  }, [session?.user]);

  const addToCart = async (productId: string, quantity: number) => {
    if (!session?.user) {
      toast({
        description: 'Please login to add items to your cart',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      await apiclient.post('/cart/items', { productId, quantity });
      await fetchCart();
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast({
        description:
          error.response?.data?.error?.message || 'Failed to add item to cart',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    if (!session?.user) return;

    try {
      setIsLoading(true);
      await apiclient.put(`/cart/items/${itemId}`, { quantity });
      await fetchCart();
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      toast({
        description:
          error.response?.data?.error?.message || 'Failed to update cart item',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!session?.user) return;

    try {
      setIsLoading(true);
      await apiclient.delete(`/cart/items/${itemId}`);
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        description: 'Failed to remove item from cart',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!session?.user) return;

    try {
      setIsLoading(true);
      await apiclient.delete('/cart');
      await fetchCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        description: 'Failed to clear cart',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        isLoading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
