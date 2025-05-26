import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { OrderStatus, OrderStatusConfig } from '../interfaces/orders';

export const orderStatusConfig: Record<OrderStatus, OrderStatusConfig> = {
  WAITING_PAYMENT: {
    label: 'Menunggu Pembayaran',
    color: 'outline',
    icon: Clock,
  },
  WAITING_PAYMENT_CONFIRMATION: {
    label: 'Menunggu Konfirmasi Pembayaran',
    color: 'outline',
    icon: Clock,
  },
  PROCESSING: {
    label: 'Diproses',
    color: 'outline',
    icon: Package,
  },
  SHIPPED: {
    label: 'Dikirim',
    color: 'default',
    icon: Truck,
  },
  CONFIRMED: {
    label: 'Selesai',
    color: 'default',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Dibatalkan',
    color: 'destructive',
    icon: XCircle,
  },
};

export function getOrderStatusConfig(
  status: OrderStatus | string,
): OrderStatusConfig {
  return status in orderStatusConfig
    ? orderStatusConfig[status as OrderStatus]
    : {
        label: 'Unknown',
        color: 'bg-gray-500',
        icon: AlertCircle,
      };
}
