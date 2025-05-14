'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';

// Status badge styling
const statusStyles = {
  WAITING_PAYMENT: { variant: 'outline', label: 'Menunggu Pembayaran' },
  WAITING_PAYMENT_CONFIRMATION: {
    variant: 'secondary',
    label: 'Menunggu Konfirmasi',
  },
  PROCESSING: { variant: 'default', label: 'Diproses' },
  SHIPPED: { variant: 'info', label: 'Dikirim' },
  CONFIRMED: { variant: 'success', label: 'Selesai' },
  CANCELLED: { variant: 'destructive', label: 'Dibatalkan' },
};

// Payment status badge styling
const paymentStatusStyles = {
  PENDING: { variant: 'outline', label: 'Tertunda' },
  PAID: { variant: 'success', label: 'Lunas' },
  FAILED: { variant: 'destructive', label: 'Gagal' },
  REFUNDED: { variant: 'warning', label: 'Dikembalikan' },
};

interface OrderDetailModalProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function OrderDetailModal({
  order,
  open,
  onOpenChange,
}: OrderDetailModalProps) {
  if (!order) return null;

  // Helper to render status badge
  const renderStatusBadge = (status) => {
    const style = statusStyles[status] || { variant: 'default', label: status };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  // Helper to render payment status badge
  const renderPaymentStatusBadge = (status) => {
    const style = paymentStatusStyles[status] || {
      variant: 'default',
      label: status,
    };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Pesanan #{order.orderNumber}</DialogTitle>
          <DialogDescription>
            <div className="flex justify-between items-center">
              <span>
                Dibuat pada{' '}
                {format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm', {
                  locale: id,
                })}
              </span>
              <div className="flex gap-2">
                Status: {renderStatusBadge(order.status)}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informasi Pelanggan</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Nama:</span> {order.user?.name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {order.user?.email}
              </div>
              <div>
                <span className="font-medium">No. Telepon:</span>{' '}
                {order.recipientPhone}
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informasi Pengiriman</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Penerima:</span>{' '}
                {order.recipientName}
              </div>
              <div>
                <span className="font-medium">Alamat:</span>{' '}
                {order.shippingAddress}
              </div>
              <div>
                <span className="font-medium">Kota:</span> {order.city},{' '}
                {order.province} {order.postalCode}
              </div>
              <div>
                <span className="font-medium">Metode:</span>{' '}
                {order.shippingMethod}
              </div>
              {order.trackingNumber && (
                <div>
                  <span className="font-medium">Nomor Resi:</span>{' '}
                  {order.trackingNumber}
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Payment Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Informasi Pembayaran</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <span className="font-medium">Metode Pembayaran:</span>{' '}
                {order.paymentMethod}
              </div>
              <div>
                <span className="font-medium">Status Pembayaran:</span>{' '}
                {renderPaymentStatusBadge(order.paymentStatus)}
              </div>
              {order.expiresAt && (
                <div>
                  <span className="font-medium">Kedaluwarsa pada:</span>{' '}
                  {format(new Date(order.expiresAt), 'dd MMMM yyyy, HH:mm', {
                    locale: id,
                  })}
                </div>
              )}
            </div>

            {/* Payment Proof */}
            {order.paymentProofs && order.paymentProofs.length > 0 && (
              <div className="space-y-2">
                <div className="font-medium">Bukti Pembayaran:</div>
                <div className="relative h-48 w-full border rounded-md overflow-hidden">
                  <Image
                    src={order.paymentProofs[0].filePath}
                    alt="Bukti Pembayaran"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Status: {order.paymentProofs[0].status}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Order Items */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Item Pesanan</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 p-2 border rounded-md"
              >
                <div className="relative h-16 w-16 shrink-0 rounded overflow-hidden">
                  {item.product.images && item.product.images.length > 0 ? (
                    <Image
                      src={item.product.images[0].imageUrl}
                      alt={item.product.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">No image</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <div className="text-sm text-muted-foreground">
                    {item.quantity} x {formatCurrency(item.price)}
                  </div>
                </div>
                <div className="font-medium">
                  {formatCurrency(item.quantity * Number(item.price))}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkos Kirim</span>
              <span>{formatCurrency(order.shippingCost)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Diskon</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Order Notes */}
        {order.notes && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Catatan</h3>
              <p className="text-sm">{order.notes}</p>
            </div>
          </>
        )}

        {/* Order History */}
        <Separator className="my-4" />
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Riwayat Status</h3>
          <div className="space-y-2">
            {Object.entries(order.statusHistory).map(([status, date]) => (
              <div
                key={status}
                className="flex justify-between items-center text-sm"
              >
                <div className="flex items-center gap-2">
                  {renderStatusBadge(status)}
                </div>
                <span>
                  {format(new Date(date), 'dd MMMM yyyy, HH:mm', {
                    locale: id,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
