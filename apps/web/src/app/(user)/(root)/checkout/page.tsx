'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { cn, formatCurrency } from '@/lib/utils';
import {
  AlertTriangle,
  CheckCircle,
  MapPin,
  Store,
  Truck,
  Receipt,
  Tag,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/client';
import { useCart } from '@/context/cart-provider';
import { PaymentMethod } from '@/lib/enums';
import MaxWidthWrapper from '@/components/max-width-wrapper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCheckout } from '@/context/checkout-provider';

export default function Checkout() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, isLoading: cartLoading } = useCart();
  const {
    addresses,
    shippingMethods,
    selectedAddressId,
    selectedShippingId,
    paymentMethod,
    notes,
    voucherCode,
    isLoading,
    isSubmitting,
    shippingCost,
    nearestStore,
    shippingDistance,
    stockAvailability,
    serviceDetails,
    calculatingShipping,
    shippingError,
    isOrderSuccess,
    orderNumber,
    total,
    setSelectedAddressId,
    setSelectedShippingId,
    setPaymentMethod,
    setNotes,
    setVoucherCode,
    handleSubmit,
    applyVoucher,
  } = useCheckout();

  const selectedAddress = addresses.find(
    (addr) => addr.id === selectedAddressId,
  );

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute(
      'data-client-key',
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
    );
    script.onload = () => console.log('Midtrans Snap script loaded');
    document.body.appendChild(script);
  }, []);

  if (isLoading || cartLoading) {
    return (
      <MaxWidthWrapper className="container max-w-2xl mx-auto py-8 px-4">
        <div className="flex flex-col gap-4 items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>Loading checkout information...</p>
        </div>
      </MaxWidthWrapper>
    );
  }

  if (items.length === 0 && !isOrderSuccess) {
    return (
      <MaxWidthWrapper className="container max-w-2xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Your cart is empty</AlertTitle>
          <AlertDescription>
            Please add some items to your cart before checkout.
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push('/')}>
          Continue Shopping
        </Button>
      </MaxWidthWrapper>
    );
  }

  if (isOrderSuccess) {
    return (
      <MaxWidthWrapper className="container max-w-md mx-auto py-8 px-4">
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Order Successful!</AlertTitle>
          <AlertDescription>
            Your order number is{' '}
            <span className="font-bold">{orderNumber}</span>
          </AlertDescription>
        </Alert>
        <div className="flex gap-4">
          <Button onClick={() => router.push(`/orders/${orderNumber}`)}>
            View Order Details
          </Button>
          <Button variant="outline" onClick={() => router.push('/')}>
            Continue Shopping
          </Button>
        </div>
      </MaxWidthWrapper>
    );
  }

  return (
    <MaxWidthWrapper className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Delivery Address Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" /> Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {addresses.length > 0 ? (
              <Select
                value={selectedAddressId}
                onValueChange={setSelectedAddressId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Address" />
                </SelectTrigger>
                <SelectContent>
                  {addresses.map((address) => (
                    <SelectItem key={address.id} value={address.id}>
                      {address.label} {address.isDefault && '(Default)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Alert>
                <AlertTitle>No addresses found</AlertTitle>
                <AlertDescription>
                  Please add an address to continue.
                </AlertDescription>
                <Button
                  className="mt-2"
                  variant="outline"
                  onClick={() => router.push('/user/settings?tab=address')}
                >
                  Add Address
                </Button>
              </Alert>
            )}

            {selectedAddress && (
              <div className="mt-4 p-3 rounded-md border bg-muted/30 text-sm">
                <p>
                  <span className="font-medium">Recipient:</span>{' '}
                  {selectedAddress.recipient}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{' '}
                  {selectedAddress.phone}
                </p>
                <p>
                  <span className="font-medium">Address:</span>{' '}
                  {selectedAddress.address}
                </p>
                <p>
                  <span className="font-medium">City/Province:</span>{' '}
                  {selectedAddress.city}, {selectedAddress.province}
                </p>
                <p>
                  <span className="font-medium">Postal Code:</span>{' '}
                  {selectedAddress.postalCode}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nearest Store Card */}
        {nearestStore && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" /> Nearest Store
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-md border bg-muted/30 text-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-base">{nearestStore.name}</p>
                    <p>{nearestStore.address}</p>
                    <p>
                      {nearestStore.city}, {nearestStore.province}
                    </p>
                  </div>
                  {shippingDistance !== null && (
                    <Badge className="text-xs">
                      {shippingDistance.toFixed(2)} km away
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error and Warning Alerts */}
        {shippingError && (
          <Alert variant="default">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Shipping Notice</AlertTitle>
            <AlertDescription>{shippingError}</AlertDescription>
          </Alert>
        )}

        {!stockAvailability.available &&
          stockAvailability.missingItems.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Stock Availability Issue</AlertTitle>
              <AlertDescription>
                The following items are not available at the nearest store:
                {stockAvailability.missingItems.map((item, index) => (
                  <span key={index} className="font-semibold block mt-1">
                    • {item.name}
                  </span>
                ))}
                Please remove or replace these items to continue.
              </AlertDescription>
            </Alert>
          )}

        {/* Shipping Method Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" /> Shipping Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calculatingShipping && (
              <div className="flex items-center justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2"></div>
                <p className="text-sm">Calculating shipping costs...</p>
              </div>
            )}

            <RadioGroup
              value={selectedShippingId}
              onValueChange={setSelectedShippingId}
              className="space-y-3"
              disabled={calculatingShipping}
            >
              {shippingMethods && shippingMethods.length > 0 ? (
                shippingMethods.map((method) => (
                  <div
                    key={method.id}
                    className={cn(
                      'flex items-start space-x-3 rounded-md border p-3',
                      method.id === selectedShippingId && 'border-primary',
                      calculatingShipping && 'opacity-50 pointer-events-none',
                    )}
                  >
                    <RadioGroupItem
                      value={method.id}
                      id={`shipping-${method.id}`}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`shipping-${method.id}`}
                        className="flex flex-col cursor-pointer"
                      >
                        <span className="font-medium">{method.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {method.description}
                        </span>
                        {serviceDetails && method.id === selectedShippingId && (
                          <span className="text-xs text-muted-foreground mt-1">
                            Est. delivery: {serviceDetails.etd} days
                          </span>
                        )}
                      </label>
                    </div>
                    <div className="text-sm font-medium">
                      {method.id === selectedShippingId
                        ? formatCurrency(shippingCost)
                        : formatCurrency(method.baseCost)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  No shipping methods available
                </div>
              )}
            </RadioGroup>
            {shippingDistance !== null && (
              <div className="mt-3 text-sm text-muted-foreground">
                <p>
                  * Shipping from nearest store (
                  {shippingDistance?.toFixed(2) || 0} km away)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Voucher Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" /> Voucher
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Input
              placeholder="Enter voucher code"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={applyVoucher}
              disabled={!voucherCode}
            >
              Apply
            </Button>
          </CardContent>
        </Card>

        {/* Payment Method Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" /> Payment Method
            </CardTitle>
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
                  paymentMethod === PaymentMethod.BANK_TRANSFER &&
                    'border-primary',
                )}
              >
                <RadioGroupItem
                  value={PaymentMethod.BANK_TRANSFER}
                  id="bank_transfer"
                />
                <div className="flex-1">
                  <label
                    htmlFor="bank_transfer"
                    className="flex flex-col cursor-pointer"
                  >
                    <span className="font-medium">Bank Transfer</span>
                    <span className="text-sm text-muted-foreground">
                      Upload payment proof after ordering
                    </span>
                  </label>
                </div>
              </div>
              <div
                className={cn(
                  'flex items-start space-x-3 rounded-md border p-3',
                  paymentMethod === PaymentMethod.PAYMENT_GATEWAY &&
                    'border-primary',
                )}
              >
                <RadioGroupItem
                  value={PaymentMethod.PAYMENT_GATEWAY}
                  id="payment_gateway"
                />
                <div className="flex-1">
                  <label
                    htmlFor="payment_gateway"
                    className="flex flex-col cursor-pointer"
                  >
                    <span className="font-medium">Payment Gateway</span>
                    <span className="text-sm text-muted-foreground">
                      Pay online securely with Midtrans
                    </span>
                  </label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Order Notes Card */}
        <Card>
          <CardHeader>
            <CardTitle>Order Notes (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add notes for your order"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </CardContent>
        </Card>

        {/* Order Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 relative rounded bg-muted">
                    <Image
                      src={
                        item.product.images?.[0]?.imageUrl || '/placeholder.png'
                      }
                      alt={item.product.name}
                      fill
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

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatCurrency(shippingCost)}</span>
              </div>
              {/* Show discount if voucher applied */}
              {/* We'll implement this when the backend supports it */}
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={
                isSubmitting ||
                calculatingShipping ||
                !selectedAddressId ||
                !selectedShippingId ||
                (!stockAvailability.available && !shippingError)
              }
            >
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </MaxWidthWrapper>
  );
}
