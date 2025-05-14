'use client';

import MaxWidthWrapper from '@/components/max-width-wrapper';
import { CartSkeleton } from '@/components/skeleton/cart-skeleton';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/cart-provider';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Cart() {
  const {
    items,
    subtotal,
    isLoading,
    updateCartItem,
    removeFromCart,
    totalItems,
  } = useCart();
  const router = useRouter();

  // Handle quantity changes
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCartItem(itemId, newQuantity);
  };

  // Handle remove item
  const removeItem = (itemId: string) => {
    removeFromCart(itemId);
    toast({
      description: 'Item removed from cart',
    });
  };

  if (isLoading) {
    return <CartSkeleton />;
  }

  if (items.length === 0) {
    return (
      <MaxWidthWrapper className="container max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-xl font-bold mb-6">Keranjang Belanja</h1>
        <div className="flex flex-col items-center justify-center py-12">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Keranjang Anda kosong</h2>
          <p className="text-muted-foreground mb-6">
            Tambahkan item ke keranjang untuk melanjutkan belanja
          </p>
          <Button onClick={() => (window.location.href = '/')}>
            Lanjutkan Belanja
          </Button>
        </div>
      </MaxWidthWrapper>
    );
  }

  return (
    <MaxWidthWrapper className="container max-w-4xl mx-auto px-4">
      <h1 className="text-xl font-bold mb-6">Keranjang Belanja</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Item Keranjang ({totalItems})</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-4 py-4 border-b last:border-0"
                >
                  <div
                    onClick={() => router.push(`/product/${item.productId}`)}
                    className="w-full sm:w-24 h-24 relative cursor-pointer"
                  >
                    <Image
                      src={
                        item.product.images.find((img) => img.isMain)
                          ?.imageUrl || '/placeholder.png'
                      }
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div
                    onClick={() => router.push(`/product/${item.productId}`)}
                    className="flex-1 cursor-pointer"
                  >
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.product.description?.substring(0, 60)}...
                    </p>
                    <p className="font-semibold">
                      {formatCurrency(item.product.price)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-center">
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-r-none"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div className="h-8 px-3 flex items-center justify-center border-y">
                        {item.quantity}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-l-none"
                        onClick={(e) => {
                          updateQuantity(item.id, item.quantity + 1);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-2 text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <Separator className="my-4" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href={'/checkout'}>Checkout</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
