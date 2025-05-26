import { PaymentStatus, OrderStatus } from '../enums';

export const statusStyles: Record<
  OrderStatus,
  { variant: any; label: string }
> = {
  WAITING_PAYMENT: { variant: 'outline', label: 'Menunggu Pembayaran' },
  WAITING_PAYMENT_CONFIRMATION: {
    variant: 'secondary',
    label: 'Menunggu Konfirmasi',
  },
  PROCESSING: { variant: 'default', label: 'Diproses' },
  SHIPPED: { variant: 'default', label: 'Dikirim' },
  CONFIRMED: { variant: 'default', label: 'Selesai' },
  CANCELLED: { variant: 'destructive', label: 'Dibatalkan' },
};

export const paymentStatusStyles: Record<
  PaymentStatus,
  { variant: any; label: string }
> = {
  PENDING: { variant: 'outline', label: 'Tertunda' },
  PAID: { variant: 'default', label: 'Lunas' },
  FAILED: { variant: 'destructive', label: 'Gagal' },
  REFUNDED: { variant: 'outline', label: 'Dikembalikan' },
};
