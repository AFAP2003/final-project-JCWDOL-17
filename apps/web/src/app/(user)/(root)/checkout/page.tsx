'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { cn, formatCurrency } from '@/lib/utils';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock cart data
const mockCartItems = [
  {
    id: '1',
    quantity: 2,
    product: {
      id: 'prod-1',
      name: 'Pakcoy',
      price: 129.99,
      imageUrl: 'https://random-image-pepebigotes.vercel.app/api/random-image',
    },
  },
  {
    id: '2',
    quantity: 1,
    product: {
      id: 'prod-2',
      name: 'Sayuran Bagus',
      price: 89.99,
      imageUrl: 'https://random-image-pepebigotes.vercel.app/api/random-image',
    },
  },
];

// Mock address data
const addressOptions = [
  {
    id: '1',
    label: 'Home',
    recipient: 'John Doe',
    address: 'Jl. Sudirman No. 10, Jakarta',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Office',
    recipient: 'John Doe',
    address: 'Jl. Gatot Subroto Kav. 20, Jakarta',
    isDefault: false,
  },
];

// Mock shipping methods
const shippingMethods = [
  {
    id: '1',
    name: 'Regular Shipping',
    description: '3-5 business days',
    cost: 15000,
  },
  {
    id: '2',
    name: 'Express Shipping',
    description: '1-2 business days',
    cost: 35000,
  },
];

export default function Checkout() {
  const [items] = useState(mockCartItems);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(
    addressOptions[0].id,
  );
  const [selectedShippingId, setSelectedShippingId] = useState(
    shippingMethods[0].id,
  );
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [notes, setNotes] = useState('');

  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const selectedShipping = shippingMethods.find(
    (method) => method.id === selectedShippingId,
  );
  const shippingCost = selectedShipping?.cost || 0;
  const total = subtotal + shippingCost;

  // Get selected address
  const selectedAddress = addressOptions.find(
    (addr) => addr.id === selectedAddressId,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate order processing
    setTimeout(() => {
      setOrderSuccess(true);
      setIsSubmitting(false);
    }, 1000);
  };

  // Show success screen
  if (orderSuccess) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Pesanan Berhasil!</AlertTitle>
          <AlertDescription>
            Nomor pesanan Anda adalah{' '}
            <span className="font-bold">ORD-123456</span>
          </AlertDescription>
        </Alert>
        <div className="flex gap-4">
          <Button>Lihat Detail Pesanan</Button>
          <Button variant="outline">Lanjutkan Belanja</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle>Alamat Pengiriman</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedAddressId}
              onValueChange={setSelectedAddressId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Alamat" />
              </SelectTrigger>
              <SelectContent>
                {addressOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label} {option.isDefault && '(Default)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedAddress && (
              <div className="mt-4 p-3 rounded-md border bg-muted/30 text-sm">
                <p>
                  <span className="font-medium">Penerima:</span>{' '}
                  {selectedAddress.recipient}
                </p>
                <p>
                  <span className="font-medium">Alamat:</span>{' '}
                  {selectedAddress.address}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping Method */}
        <Card>
          <CardHeader>
            <CardTitle>Metode Pengiriman</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedShippingId}
              onValueChange={setSelectedShippingId}
              className="space-y-3"
            >
              {shippingMethods.map((method) => (
                <div
                  key={method.id}
                  className={cn(
                    'flex items-start space-x-3 rounded-md border p-3',
                    method.id === selectedShippingId && 'border-primary',
                  )}
                >
                  <RadioGroupItem
                    value={method.id}
                    id={`shipping-${method.id}`}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`shipping-${method.id}`}
                      className="flex justify-between cursor-pointer"
                    >
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {method.description}
                        </p>
                      </div>
                      <div className="font-medium">
                        {formatCurrency(method.cost)}
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="space-y-3"
            >
              <div
                className={cn(
                  'flex items-start space-x-3 rounded-md border p-3',
                  paymentMethod === 'BANK_TRANSFER' && 'border-primary',
                )}
              >
                <RadioGroupItem value="BANK_TRANSFER" id="bank_transfer" />
                <div className="flex-1">
                  <label
                    htmlFor="bank_transfer"
                    className="flex flex-col cursor-pointer"
                  >
                    <span className="font-medium">Bank Transfer</span>
                    <span className="text-sm text-muted-foreground">
                      Upload bukti pembayaran setelah memesan
                    </span>
                  </label>
                </div>
              </div>
              <div
                className={cn(
                  'flex items-start space-x-3 rounded-md border p-3',
                  paymentMethod === 'PAYMENT_GATEWAY' && 'border-primary',
                )}
              >
                <RadioGroupItem value="PAYMENT_GATEWAY" id="payment_gateway" />
                <div className="flex-1">
                  <label
                    htmlFor="payment_gateway"
                    className="flex flex-col cursor-pointer"
                  >
                    <span className="font-medium">Payment Gateway</span>
                    <span className="text-sm text-muted-foreground">
                      Bayar secara online
                    </span>
                  </label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Order Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Catatan (Opsional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Tambahkan catatan untuk pesanan Anda"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Cart Items */}
            <div className="space-y-3 mb-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 relative rounded bg-muted">
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      width={48}
                      height={48}
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} x {formatCurrency(item.product.price)}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-3" />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Biaya Pengiriman</span>
                <span>{formatCurrency(shippingCost)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Memproses...' : 'Lanjut ke Pembayaran'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
