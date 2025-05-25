import { Order } from '../interfaces/orders';

export type OrderContextType = {
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
};
