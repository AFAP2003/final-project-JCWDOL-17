'use client';

import { useSession } from '@/lib/auth/client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
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
import {
  getOrderStatusConfig,
  orderStatusConfig,
} from '@/lib/config/order-config';
import { OrderStatusBadgeProps } from '@/lib/types/orders';
import { mockOrderList } from '@/lib/mocks/order-data';

function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = getOrderStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-1.5">
      <Badge variant={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    </div>
  );
}

export default function Orders() {
  // const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('all');

  const OrdersData = mockOrderList;

  // Filter orders based on active tab
  const filteredOrders =
    activeTab === 'all'
      ? OrdersData
      : OrdersData.filter((order) => {
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
