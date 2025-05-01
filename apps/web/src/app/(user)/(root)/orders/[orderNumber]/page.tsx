'use client';

import React, { useState } from 'react';
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
  Badge,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { mockOrderData } from '@/lib/mocks/order-data';
import { getOrderStatusConfig } from '@/lib/config/order-config';
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
import { OrderStatusBadgeProps } from '@/lib/types/orders';

export default function OrderDetailsPage({}) {
  const router = useRouter();
  const [isPaymentProofDialogOpen, setIsPaymentProofDialogOpen] =
    useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(
    null,
  );

  const order = mockOrderData;

  const uploadPaymentProofMutation = null;

  function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
    const config = getOrderStatusConfig(status);
    const Icon = config.icon;

    return (
      <div className="flex items-center gap-1.5">
        <Badge className={`${config.color} text-white`}>
          <Icon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          Detail Pesanan: {order.orderNumber}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>
      {order.paymentStatus === 'PENDING' && (
        <Card className="mb-6">
          <CardContent className="flex flex-col md:flex-row justify-between items-center p-6 gap-4">
            <div>
              <h3 className="font-semibold">Pembayaran Tertunda</h3>
              <p className="text-sm text-muted-foreground">
                Silakan upload bukti pembayaran Anda untuk memproses pesanan.
              </p>
            </div>
            <Button onClick={() => setIsPaymentProofDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Bukti Pembayaran
            </Button>
          </CardContent>
        </Card>
      )}

      {(order.status === 'SHIPPED' || order.status === 'COMPLETED') &&
        order.trackingNumber && (
          <Card className="mb-6">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <TruckIcon className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="font-medium">Nomor Resi</p>
                  <p className="text-sm text-muted-foreground">
                    {order.trackingNumber}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Lacak Pengiriman
              </Button>
            </CardContent>
          </Card>
        )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Barang Dipesan ({order.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} x {formatCurrency(item.price)}
                  </p>
                </div>
                <p className="font-medium">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ongkos Kirim</span>
              <span>{formatCurrency(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Alamat Pengiriman</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
              <div>
                <p className="font-medium">{order.shippingAddress.recipient}</p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress.address}
                </p>
                {order.shippingAddress.phoneNumber && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Telepon: {order.shippingAddress.phoneNumber}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rincian Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tanggal Pesanan</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Metode Pembayaran</span>
                <span>
                  {order.paymentMethod === 'BANK_TRANSFER'
                    ? 'Transfer Bank'
                    : 'Payment Gateway'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status Pembayaran</span>
                <span
                  className={`${
                    order.paymentStatus === 'PAID'
                      ? 'text-green-500'
                      : order.paymentStatus === 'PENDING'
                        ? 'text-yellow-500'
                        : 'text-red-500'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Metode Pengiriman</span>
                <span>{order.shippingMethod}</span>
              </div>
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
            {/* File Input */}
            <div>
              <Label htmlFor="payment-proof">Payment Proof</Label>
              <Input
                id="payment-proof"
                type="file"
                accept=".jpg,.jpeg,.png"
                className="mt-2"
              />
            </div>

            {/* Preview */}
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
            <Button>Uploading...</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {order.status === 'SHIPPED' && (
        <Card>
          <CardContent className="flex flex-col md:flex-row justify-between items-center p-6 gap-4">
            <div>
              <h3 className="font-semibold">Pesanan Telah Dikirim</h3>
              <p className="text-sm text-muted-foreground">
                Pesanan Anda telah dikirim. Mohon konfirmasi penerimaan saat
                Anda menerimanya.
              </p>
            </div>
            <Button>Konfirmasi Penerimaan</Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-6">
        <Button variant="outline" onClick={() => router.push('/orders')}>
          Kembali ke Daftar Pesanan
        </Button>
      </div>
    </div>
  );
}
