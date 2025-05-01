import { LucideIcon } from 'lucide-react';

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ShippingAddress {
  recipient: string;
  address: string;
  phoneNumber?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  shippingCost: number;
  createdAt: string;
  paymentMethod: 'BANK_TRANSFER' | 'PAYMENT_GATEWAY';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  shippingMethod: string;
  trackingNumber?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
}

export type OrderStatus =
  | 'WAITING_PAYMENT'
  | 'WAITING_PAYMENT_CONFIRMATION'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'CONFIRMED'
  | 'CANCELLED';

export interface OrderStatusConfig {
  label: string;
  color: string;
  icon: LucideIcon;
}

export interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  className?: string;
}
