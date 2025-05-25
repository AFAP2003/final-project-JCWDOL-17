import { User } from 'better-auth/types';
import { LucideIcon } from 'lucide-react';
import { Table as ReactTable, Table } from '@tanstack/react-table';
import { PaymentStatus, OrderStatus } from '../enums';

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  product: {
    name: string;
    images?: Array<{
      imageUrl: string;
    }>;
  };
}

export interface ShippingAddress {
  recipient: string;
  address: string;
  phoneNumber?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  user?: User;
  status: OrderStatus;
  total: number;
  subtotal: number;
  shippingCost: number;
  createdAt: string;
  paymentMethod: 'BANK_TRANSFER' | 'PAYMENT_GATEWAY';
  paymentStatus: PaymentStatus;
  shippingMethod: string;
  trackingNumber?: string;
  items: OrderItem[];
  shippingAddress: (ShippingAddress & { address?: string }) | string;
  recipientPhone?: string;
  recipientName?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  expiresAt?: string;
  paymentProofs: Array<{
    filePath: string;
    status: string;
  }>;
  discount: number;
  notes?: string;
  statusHistory: Record<string, string>;
}

export interface OrderStatusConfig {
  label: string;
  color: string;
  icon: LucideIcon;
}

export interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  className?: string;
}

export interface ShipOrderModalProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending?: boolean;
  onSuccess?: () => void;
}

export interface OrderManagementTableProps {
  table: ReactTable<any>;
  columns: any[];
  onViewOrder: (order: any) => void;
  onConfirmPayment: (order: any) => void;
  onShipOrder: (order: any) => void;
  onCancelOrder: (order: any) => void;
}

export interface OrderManagementFilterProps {
  globalFilter: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStatusFilter: (value: string) => void;
  handleWarehouseFilter: (value: string) => void;
  handleDateRangeFilter: (dateRange: { from: Date; to: Date }) => void;
  table: Table<any>;
  warehouses: Array<{ id: string; name: string }>;
}

export interface OrderDetailModalProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface OrderContextType {
  orders: Order[];
  activeOrders: Order[];
  completedOrders: Order[];
  cancelledOrders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  isSubmitting: boolean;
  activeTab: string;
  paymentProofFile: File | null;
  paymentProofPreview: string | null;
  uploadingPaymentProof: boolean;
  fetchOrders: () => Promise<void>;
  fetchOrderDetails: (orderNumber: string) => Promise<Order | undefined>;
  cancelOrder: (orderId: string) => Promise<Order | undefined>;
  confirmOrder: (orderId: string) => Promise<Order | undefined>;
  setActiveTab: (tab: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadPaymentProof: (orderId: string) => Promise<Order | undefined>;
  searchOrders: (query: string) => Promise<any>;
  initializePayment: (orderId: string) => Promise<any>;
}
