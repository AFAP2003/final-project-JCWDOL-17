'use client';

import { useSession } from '@/lib/auth/client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import {
  ChevronRight,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

// Mock orders for UI testing purposes
const mockOrders = [
  {
    id: '1',
    orderNumber: 'ORD-123456',
    status: 'WAITING_PAYMENT',
    total: 359970,
    createdAt: '2025-04-12T14:30:00.000Z',
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PENDING',
    shippingMethod: 'Regular Shipping',
    items: [
      {
        id: '1',
        productName: 'Pakcoy',
        quantity: 2,
        price: 129990,
        subtotal: 259980,
      },
      {
        id: '2',
        productName: 'Sayuran Bagus',
        quantity: 1,
        price: 89990,
        subtotal: 89990,
      },
    ],
    shippingCost: 10000,
  },
  {
    id: '2',
    orderNumber: 'ORD-123457',
    status: 'PROCESSING',
    total: 249990,
    createdAt: '2025-04-10T09:15:00.000Z',
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    shippingMethod: 'Express Shipping',
    items: [
      {
        id: '3',
        productName: 'Wortel Organik',
        quantity: 3,
        price: 59990,
        subtotal: 179970,
      },
      {
        id: '4',
        productName: 'Brokoli Segar',
        quantity: 1,
        price: 45000,
        subtotal: 45000,
      },
    ],
    shippingCost: 25000,
  },
  {
    id: '3',
    orderNumber: 'ORD-123458',
    status: 'SHIPPED',
    total: 529980,
    createdAt: '2025-04-08T11:45:00.000Z',
    paymentMethod: 'PAYMENT_GATEWAY',
    paymentStatus: 'PAID',
    shippingMethod: 'Regular Shipping',
    trackingNumber: 'TRK987654321',
    items: [
      {
        id: '5',
        productName: 'Apel Malang',
        quantity: 4,
        price: 129990,
        subtotal: 519960,
      },
    ],
    shippingCost: 10000,
  },
  {
    id: '4',
    orderNumber: 'ORD-123459',
    status: 'CONFIRMED',
    total: 229990,
    createdAt: '2025-04-01T16:20:00.000Z',
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    shippingMethod: 'Regular Shipping',
    items: [
      {
        id: '6',
        productName: 'Kale Organik',
        quantity: 2,
        price: 89990,
        subtotal: 179980,
      },
      {
        id: '7',
        productName: 'Sawi Hijau',
        quantity: 5,
        price: 7990,
        subtotal: 39950,
      },
    ],
    shippingCost: 10000,
  },
  {
    id: '5',
    orderNumber: 'ORD-123460',
    status: 'CANCELLED',
    total: 309990,
    createdAt: '2025-03-29T10:10:00.000Z',
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'FAILED',
    shippingMethod: 'Express Shipping',
    cancelReason: 'Pembayaran tidak dilakukan dalam waktu 24 jam',
    items: [
      {
        id: '8',
        productName: 'Bayam Organik',
        quantity: 3,
        price: 94990,
        subtotal: 284970,
      },
    ],
    shippingCost: 25000,
  },
];

// Status badge configurations
const statusConfig = {
  WAITING_PAYMENT: {
    label: 'Menunggu Pembayaran',
    color: 'bg-yellow-500',
    icon: Clock,
  },
  WAITING_PAYMENT_CONFIRMATION: {
    label: 'Menunggu Konfirmasi Pembayaran',
    color: 'bg-yellow-500',
    icon: Clock,
  },
  PROCESSING: {
    label: 'Diproses',
    color: 'bg-blue-500',
    icon: Package,
  },
  SHIPPED: {
    label: 'Dikirim',
    color: 'bg-indigo-500',
    icon: Truck,
  },
  CONFIRMED: {
    label: 'Selesai',
    color: 'bg-green-500',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Dibatalkan',
    color: 'bg-red-500',
    icon: XCircle,
  },
};

function OrderStatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: 'Unknown',
    color: 'bg-gray-500',
    icon: AlertCircle,
  };

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

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function Orders() {
  // const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('all');

  // Filter orders based on active tab
  const filteredOrders =
    activeTab === 'all'
      ? mockOrders
      : mockOrders.filter((order) => {
          if (activeTab === 'active') {
            return [
              'WAITING_PAYMENT',
              'WAITING_PAYMENT_CONFIRMATION',
              'PROCESSING',
              'SHIPPED',
            ].includes(order.status);
          } else if (activeTab === 'completed') {
            return order.status === 'CONFIRMED';
          } else if (activeTab === 'cancelled') {
            return order.status === 'CANCELLED';
          }
          return true;
        });

  // if (!session) {
  //   return (
  //     <div className="container max-w-4xl mx-auto py-8 px-4">
  //       <Card>
  //         <CardContent className="py-8">
  //           <div className="text-center">
  //             <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
  //             <h2 className="text-xl font-semibold mb-2">
  //               Silakan masuk terlebih dahulu
  //             </h2>
  //             <p className="text-muted-foreground mb-6">
  //               Anda perlu masuk untuk melihat pesanan Anda
  //             </p>
  //             <Button asChild>
  //               <Link href="/auth/signin">Masuk</Link>
  //             </Button>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-6">Pesanan Saya</h1>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="active">Aktif</TabsTrigger>
          <TabsTrigger value="completed">Selesai</TabsTrigger>
          <TabsTrigger value="cancelled">Dibatalkan</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    Tidak ada pesanan
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Anda belum memiliki pesanan dalam kategori ini
                  </p>
                  <Button asChild>
                    <Link href="/">Mulai Berbelanja</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {order.orderNumber}
                      </CardTitle>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>
                        Tanggal Pesanan: {formatDate(order.createdAt)}
                      </span>
                      <span>Total: {formatCurrency(order.total)}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="mt-2 mb-3">
                      <h3 className="font-medium mb-2">Ringkasan Pesanan:</h3>
                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={item.id} className="flex justify-between">
                            <span className="text-sm">
                              {item.quantity}x {item.productName}
                            </span>
                            <span className="text-sm font-medium">
                              {formatCurrency(item.subtotal)}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-sm text-muted-foreground">
                            ...dan {order.items.length - 2} item lainnya
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <span className="text-sm">
                          {order.paymentMethod === 'BANK_TRANSFER'
                            ? 'Transfer Bank'
                            : 'Payment Gateway'}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="text-sm">{order.shippingMethod}</span>
                      </div>
                      <Button variant="secondary" size="sm" asChild>
                        <Link href={`/orders/${order.orderNumber}`}>
                          Detail Pesanan
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
