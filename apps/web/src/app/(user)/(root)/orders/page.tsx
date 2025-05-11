'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderStatusBadge } from '@/components/order-status-badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AlertCircle, ChevronRight, Package, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useOrders } from '@/context/order-provider';
import { useSession } from '@/lib/auth/client';
import MaxWidthWrapper from '@/components/max-width-wrapper';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function Orders() {
  const { data: session } = useSession();
  const {
    orders,
    activeOrders,
    completedOrders,
    cancelledOrders,
    isLoading,
    activeTab,
    setActiveTab,
    fetchOrders,
    searchOrders,
  } = useOrders();

  useEffect(() => {
    if (session) {
      fetchOrders();
    }
  }, [session]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('query') as string;
    if (query) {
      searchOrders(query);
    } else {
      fetchOrders();
    }
  };

  if (!session) {
    return (
      <MaxWidthWrapper className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Please sign in first
              </h2>
              <p className="text-muted-foreground mb-6">
                You need to sign in to view your orders
              </p>
              <Button asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </MaxWidthWrapper>
    );
  }

  return (
    <MaxWidthWrapper className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My Orders</h1>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-sm items-center space-x-2"
        >
          <Input
            type="search"
            name="query"
            placeholder="Search orders"
            className="max-w-64"
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <>
              {(activeTab === 'all' && orders.length === 0) ||
              (activeTab === 'active' && activeOrders.length === 0) ||
              (activeTab === 'completed' && completedOrders.length === 0) ||
              (activeTab === 'cancelled' && cancelledOrders.length === 0) ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h2 className="text-xl font-semibold mb-2">
                        No orders found
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        You don't have any orders in this category
                      </p>
                      <Button asChild>
                        <Link href="/">Start Shopping</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Display orders based on active tab */}
                  {(activeTab === 'all'
                    ? orders
                    : activeTab === 'active'
                      ? activeOrders
                      : activeTab === 'completed'
                        ? completedOrders
                        : cancelledOrders
                  ).map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-0">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {order.orderNumber}
                          </CardTitle>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <span>Order Date: {formatDate(order.createdAt)}</span>
                          <span>Total: {formatCurrency(order.total)}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="mt-2 mb-3">
                          <h3 className="font-medium mb-2">Order Summary:</h3>
                          <div className="space-y-2">
                            {order.items.slice(0, 2).map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between"
                              >
                                <span className="text-sm">
                                  {item.quantity}x {item.product.name}
                                </span>
                                <span className="text-sm font-medium">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="text-sm text-muted-foreground">
                                ...and {order.items.length - 2} more items
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="flex items-center justify-between mt-2">
                          <div>
                            <span className="text-sm">
                              {order.paymentMethod === 'BANK_TRANSFER'
                                ? 'Bank Transfer'
                                : 'Payment Gateway'}
                            </span>
                            <span className="mx-2">•</span>
                            <span className="text-sm">
                              {order.shippingMethod}
                            </span>
                          </div>
                          <Button variant="secondary" size="sm" asChild>
                            <Link href={`/orders/${order.orderNumber}`}>
                              Order Details
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </MaxWidthWrapper>
  );
}
