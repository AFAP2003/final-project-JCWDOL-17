'use client';

import React, { useEffect, useState } from 'react';
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
import { AlertTriangle, CheckCircle, MapPin, Store, Truck } from 'lucide-react';
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
import { apiclient } from '@/lib/apiclient';
import { toast } from '@/hooks/use-toast';
import MaxWidthWrapper from '@/components/max-width-wrapper';

export default function Checkout() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, isLoading: cartLoading, clearCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedShippingId, setSelectedShippingId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>(
    PaymentMethod.BANK_TRANSFER,
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New state for shipping calculation
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [nearestStore, setNearestStore] = useState<any>(null);
  const [shippingDistance, setShippingDistance] = useState<number | null>(null);
  const [serviceDetails, setServiceDetails] = useState<{
    courier: string;
    service: string;
    etd: string;
  } | null>(null);
  const [stockAvailability, setStockAvailability] = useState({
    available: true,
    missingItems: [],
  });
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin?redirect=/checkout');
      return;
    }

    const fetchCheckoutData = async () => {
      try {
        setIsLoading(true);

        // Get user addresses
        const addressResponse = await apiclient.get('/user/address');
        setAddresses(addressResponse.data.addresses || []);

        if (addressResponse.data.addresses.length > 0) {
          // Set default address if available, otherwise use the first one
          const defaultAddress =
            addressResponse.data.addresses.find(
              (addr: any) => addr.isDefault,
            ) || addressResponse.data.addresses[0];
          setSelectedAddressId(defaultAddress.id);
        }

        // Get shipping methods
        const shippingResponse = await apiclient.get('/shipping-methods');
        setShippingMethods(shippingResponse.data || []);

        if (shippingResponse.data.length > 0) {
          setSelectedShippingId(shippingResponse.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching checkout data:', error);
        toast({
          description: 'Failed to load checkout information',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckoutData();
  }, [session, router]);

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        setIsLoading(true);

        // Get user addresses
        const addressResponse = await apiclient.get('/user/address');
        console.log('Address response:', addressResponse.data); // Debug log
        setAddresses(addressResponse.data.addresses || []);

        if (addressResponse.data.addresses?.length > 0) {
          // Set default address if available, otherwise use the first one
          const defaultAddress =
            addressResponse.data.addresses.find((addr) => addr.isDefault) ||
            addressResponse.data.addresses[0];
          setSelectedAddressId(defaultAddress.id);
        }

        // Rest of your code...
      } catch (error) {
        console.error('Error fetching checkout data:', error); // Expanded error logging
        toast({
          description: 'Failed to load checkout information',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckoutData();
  }, [session, router]);

  const selectedAddress = addresses.find(
    (addr) => addr.id === selectedAddressId,
  );

  const total = subtotal + shippingCost;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAddressId) {
      toast({
        description: 'Please select a delivery address',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedShippingId) {
      toast({
        description: 'Please select a shipping method',
        variant: 'destructive',
      });
      return;
    }

    if (!stockAvailability.available) {
      toast({
        description: 'Some items are unavailable at the nearest store',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await apiclient.post('/orders', {
        addressId: selectedAddressId,
        shippingMethodId: selectedShippingId,
        paymentMethod: paymentMethod,
        notes: notes || undefined,
      });

      // Clear cart after successful order
      await clearCart();

      // Show success message
      setOrderNumber(response.data.orderNumber);
      setOrderSuccess(true);
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        description:
          error.response?.data?.error?.message || 'Failed to create order',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (items.length === 0 && !orderSuccess) {
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

  // Show success screen
  if (orderSuccess) {
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
        {/* Shipping Address */}
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

        {/* Nearest Store */}
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

        {/* Stock Availability Warning */}
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

        {/* Shipping Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" /> Shipping Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calculatingShipping ? (
              <div className="flex items-center justify-center py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2"></div>
                <p>Calculating shipping costs...</p>
              </div>
            ) : (
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
                          {serviceDetails &&
                            method.id === selectedShippingId && (
                              <div className="mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {serviceDetails.courier.toUpperCase()} •{' '}
                                  {serviceDetails.service} •{' '}
                                  {serviceDetails.etd} days
                                </Badge>
                              </div>
                            )}
                        </div>
                        <div className="font-medium">
                          {formatCurrency(
                            method.id === selectedShippingId
                              ? shippingCost
                              : method.baseCost,
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Show distance to store note */}
            {shippingDistance !== null && (
              <div className="mt-3 text-sm text-muted-foreground">
                <p>
                  * Shipping from nearest store ({shippingDistance.toFixed(2)}{' '}
                  km away)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
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
                      Pay online securely
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

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Cart Items */}
            <div className="space-y-3 mb-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 relative rounded bg-muted">
                    <Image
                      src={
                        item.product.images[0]?.imageUrl || '/placeholder.png'
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

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
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
            <Button
              type="submit"
              className="w-full"
              disabled={
                isSubmitting ||
                calculatingShipping ||
                !stockAvailability.available
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
