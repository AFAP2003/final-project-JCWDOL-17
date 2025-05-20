'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Upload,
  FileText,
  MapPin,
  TruckIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useOrders } from '@/context/order-provider';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import MaxWidthWrapper from '@/components/max-width-wrapper';
import { useSession } from '@/lib/auth/client';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@/lib/enums';
import { OrderStatusBadge } from '@/components/order-status-badge';
import { CancelOrderModal } from '@/components/modal/cancel-order-modal';
import { ConfirmOrderModal } from '@/components/modal/confirm-order-modal';

export default function OrderDetailsPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    currentOrder,
    isLoading,
    isSubmitting,
    paymentProofFile,
    paymentProofPreview,
    uploadingPaymentProof,
    fetchOrderDetails,
    cancelOrder,
    confirmOrder,
    handleFileChange,
    uploadPaymentProof,
    initializePayment,
  } = useOrders();

  const [isPaymentProofDialogOpen, setIsPaymentProofDialogOpen] =
    useState(false);
  const [isPaymentGatewayDialogOpen, setIsPaymentGatewayDialogOpen] =
    useState(false);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (session && params.orderNumber) {
      fetchOrderDetails(params.orderNumber);
    }
  }, [session, params.orderNumber]);

  const isOrderExpired = () => {
    if (!currentOrder?.expiresAt) return false;
    return new Date(currentOrder.expiresAt) < new Date();
  };

  const handlePaymentGateway = async () => {
    if (!currentOrder) return;
    await initializePayment(currentOrder.id);
  };

  const handleCancelOrder = async () => {
    if (!currentOrder) return;
    await cancelOrder(currentOrder.id);
  };

  const handleConfirmOrder = async () => {
    if (!currentOrder) return;
    await confirmOrder(currentOrder.id);
  };

  const handleUploadPaymentProof = async () => {
    if (!currentOrder) return;
    await uploadPaymentProof(currentOrder.id);
    setIsPaymentProofDialogOpen(false);
  };

  if (isLoading) {
    return (
      <MaxWidthWrapper className="container max-w-2xl mx-auto py-8 px-4">
        <div className="flex flex-col gap-4 items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>Loading order details...</p>
        </div>
      </MaxWidthWrapper>
    );
  }

  if (!currentOrder) {
    return (
      <MaxWidthWrapper className="container max-w-2xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Order not found</AlertTitle>
          <AlertDescription>
            The order you are looking for does not exist or you don't have
            permission to view it.
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push('/orders')}>
          Back to Orders
        </Button>
      </MaxWidthWrapper>
    );
  }

  return (
    <MaxWidthWrapper className="container max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          Order: {currentOrder.orderNumber}
        </h1>
        <OrderStatusBadge status={currentOrder.status} />
      </div>

      {currentOrder.status === OrderStatus.WAITING_PAYMENT && (
        <Card className="mb-6">
          <CardContent className="flex flex-col md:flex-row justify-between items-center p-6 gap-4">
            <div>
              <h3 className="font-semibold">Payment Pending</h3>
              <p className="text-sm text-muted-foreground">
                {isOrderExpired()
                  ? 'Your order has expired due to no payment within time limit.'
                  : 'Please complete your payment to process your order.'}
              </p>
              {!isOrderExpired() && currentOrder.expiresAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Payment due by: {formatDate(currentOrder.expiresAt)}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {!isOrderExpired() &&
                currentOrder.paymentMethod === PaymentMethod.BANK_TRANSFER && (
                  <Button onClick={() => setIsPaymentProofDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Payment Proof
                  </Button>
                )}
              {!isOrderExpired() &&
                currentOrder.paymentMethod ===
                  PaymentMethod.PAYMENT_GATEWAY && (
                  <Button onClick={() => handlePaymentGateway()}>
                    Pay Now
                  </Button>
                )}
              {!isOrderExpired() && (
                <Button
                  variant="outline"
                  onClick={() => setIsCancelModalOpen(true)}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {(currentOrder.status === OrderStatus.SHIPPED ||
        currentOrder.status === OrderStatus.CONFIRMED) &&
        currentOrder.trackingNumber && (
          <Card className="mb-6">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <TruckIcon className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="font-medium">Tracking Number</p>
                  <p className="text-sm text-muted-foreground">
                    {currentOrder.trackingNumber}
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm">
                Track Shipment
              </Button>
            </CardContent>
          </Card>
        )}

      {currentOrder.status === OrderStatus.SHIPPED && (
        <Card className="mb-6">
          <CardContent className="flex flex-col md:flex-row justify-between items-center p-6 gap-4">
            <div>
              <h3 className="font-semibold">Your Order Has Been Shipped</h3>
              <p className="text-sm text-muted-foreground">
                Please confirm receipt when you receive your items.
              </p>
            </div>
            <Button onClick={() => setIsConfirmModalOpen(true)}>
              Confirm Receipt
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Ordered Items ({currentOrder.items?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentOrder.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {item.product?.images?.[0]?.imageUrl && (
                    <div className="w-16 h-16 relative">
                      <Image
                        src={item.product.images[0].imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
                <p className="font-medium">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(currentOrder.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatCurrency(currentOrder.shippingCost)}</span>
            </div>

            {currentOrder.discount > 0 &&
              currentOrder.appliedVouchers &&
              currentOrder.appliedVouchers.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" /> Applied Vouchers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentOrder.appliedVouchers.map(
                        (voucherApplied: any) => (
                          <div
                            key={voucherApplied.id}
                            className="p-3 bg-green-50 border border-green-200 rounded-md"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-700">
                                  {voucherApplied.voucher?.name ||
                                    'Voucher Applied'}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-green-700">
                                -{formatCurrency(voucherApplied.discount)}
                              </span>
                            </div>
                            {voucherApplied.voucher?.description && (
                              <p className="text-xs text-green-600 mt-1">
                                {voucherApplied.voucher.description}
                              </p>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            {currentOrder.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span className="text-muted-foreground">Discount</span>
                <span>-{formatCurrency(currentOrder.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(currentOrder.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
              <div>
                <p className="font-medium">{currentOrder.recipientName}</p>
                <p className="text-sm text-muted-foreground">
                  {currentOrder.shippingAddress}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentOrder.city}, {currentOrder.province}{' '}
                  {currentOrder.postalCode}
                </p>
                {currentOrder.recipientPhone && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Phone: {currentOrder.recipientPhone}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order Date</span>
                <span>{formatDate(currentOrder.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span>
                  {currentOrder.paymentMethod === PaymentMethod.BANK_TRANSFER
                    ? 'Bank Transfer'
                    : 'Payment Gateway'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Status</span>
                <span
                  className={`${
                    currentOrder.paymentStatus === PaymentStatus.PAID
                      ? 'text-green-500'
                      : currentOrder.paymentStatus === PaymentStatus.PENDING
                        ? 'text-yellow-500'
                        : 'text-red-500'
                  }`}
                >
                  {currentOrder.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping Method</span>
                <span>{currentOrder.shippingMethod}</span>
              </div>
              {currentOrder.appliedVouchers &&
                currentOrder.appliedVouchers.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Voucher Applied
                    </span>
                    <span className="text-green-600">Yes</span>
                  </div>
                )}
              {currentOrder.notes && (
                <div className="pt-2">
                  <span className="text-muted-foreground text-sm">Notes:</span>
                  <p className="text-sm mt-1">{currentOrder.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={isPaymentProofDialogOpen}
        onOpenChange={setIsPaymentProofDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Payment Proof</DialogTitle>
            <DialogDescription>
              Upload a clear image of your payment receipt. Allowed types: JPG,
              JPEG, PNG (max 1MB)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-proof">Payment Proof</Label>
              <Input
                id="payment-proof"
                type="file"
                accept=".jpg,.jpeg,.png"
                className="mt-2"
                onChange={handleFileChange}
              />
            </div>

            {paymentProofPreview && (
              <div className="relative w-full aspect-video">
                <Image
                  src={paymentProofPreview}
                  alt="Payment Proof Preview"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleUploadPaymentProof}
              disabled={!paymentProofFile || uploadingPaymentProof}
            >
              {uploadingPaymentProof ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CancelOrderModal
        order={currentOrder}
        open={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirmCancel={cancelOrder}
      />

      <ConfirmOrderModal
        order={currentOrder}
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmOrder}
      />

      <div className="mt-6">
        <Button variant="outline" onClick={() => router.push('/orders')}>
          Back to All Orders
        </Button>
      </div>
    </MaxWidthWrapper>
  );
}
