import React from 'react';
import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/lib/enums';
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  AlertTriangle,
  LucideIcon,
} from 'lucide-react';

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

interface StatusConfig {
  label: string;
  color: string;
  icon: LucideIcon;
}

export function getOrderStatusConfig(status: OrderStatus): StatusConfig {
  switch (status) {
    case OrderStatus.WAITING_PAYMENT:
      return {
        label: 'Awaiting Payment',
        color: 'bg-yellow-500',
        icon: Clock,
      };
    case OrderStatus.WAITING_PAYMENT_CONFIRMATION:
      return {
        label: 'Payment Confirmation',
        color: 'bg-blue-500',
        icon: Clock,
      };
    case OrderStatus.PROCESSING:
      return {
        label: 'Processing',
        color: 'bg-purple-500',
        icon: Package,
      };
    case OrderStatus.SHIPPED:
      return {
        label: 'Shipped',
        color: 'bg-indigo-500',
        icon: Truck,
      };
    case OrderStatus.CONFIRMED:
      return {
        label: 'Completed',
        color: 'bg-green-500',
        icon: CheckCircle,
      };
    case OrderStatus.CANCELLED:
      return {
        label: 'Cancelled',
        color: 'bg-red-500',
        icon: AlertTriangle,
      };
    default:
      return {
        label: status,
        color: 'bg-gray-500',
        icon: Clock,
      };
  }
}

export function OrderStatusBadge({
  status,
  className = '',
}: OrderStatusBadgeProps) {
  const config = getOrderStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} text-white ${className}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
