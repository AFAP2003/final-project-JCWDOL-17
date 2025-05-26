'use client';

import MaxWidthWrapper from '@/components/max-width-wrapper';
import { OrderStatusBadge } from '@/components/order-status-badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrders } from '@/context/order-provider';
import { useSession } from '@/lib/auth/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AlertCircle, ChevronRight, Package, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
    cancelOrder,
  } = useOrders();

  // New state for pagination and order cancellation
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Handle order cancellation
  const openCancelModal = (order: any) => {
    setOrderToCancel(order);
    setCancelModalOpen(true);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      setIsProcessing(true);
      await cancelOrder(orderToCancel.id);
      setCancelModalOpen(false);
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Pagination logic
  const getDisplayedOrders = () => {
    let filteredOrders = [];

    switch (activeTab) {
      case 'active':
        filteredOrders = activeOrders;
        break;
      case 'completed':
        filteredOrders = completedOrders;
        break;
      case 'cancelled':
        filteredOrders = cancelledOrders;
        break;
      default:
        filteredOrders = orders;
    }

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  };

  const totalPages = Math.ceil(
    (activeTab === 'all'
      ? orders.length
      : activeTab === 'active'
        ? activeOrders.length
        : activeTab === 'completed'
          ? completedOrders.length
          : cancelledOrders.length) / itemsPerPage,
  );

  // Reset to first page when changing tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

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
              {getDisplayedOrders().length === 0 ? (
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
                <>
                  <div className="space-y-4">
                    {/* Display orders based on active tab and pagination */}
                    {getDisplayedOrders().map((order) => (
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
                              Order Date: {formatDate(order.createdAt)}
                            </span>
                            <span>Total: {formatCurrency(order.total)}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="mt-2 mb-3">
                            <h3 className="font-medium mb-2">Order Summary:</h3>
                            <div className="space-y-2">
                              {order.items.slice(0, 2).map((item: any) => (
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
                            <div className="flex gap-2">
                              {order.status === 'WAITING_PAYMENT' && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => openCancelModal(order)}
                                >
                                  Cancel
                                </Button>
                              )}
                              <Button variant="secondary" size="sm" asChild>
                                <Link href={`/orders/${order.orderNumber}`}>
                                  Order Details
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            aria-disabled={currentPage === 1}
                            className={
                              currentPage === 1
                                ? 'pointer-events-none opacity-50'
                                : ''
                            }
                          />
                        </PaginationItem>

                        {/* First page */}
                        {currentPage > 3 && (
                          <PaginationItem>
                            <PaginationLink onClick={() => setCurrentPage(1)}>
                              1
                            </PaginationLink>
                          </PaginationItem>
                        )}

                        {/* Ellipsis if needed */}
                        {currentPage > 3 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}

                        {/* Pages near current page */}
                        {Array.from(
                          { length: Math.min(3, totalPages) },
                          (_, i) => {
                            let pageNum;

                            if (currentPage <= 2) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 1) {
                              pageNum = totalPages - 2 + i;
                            } else {
                              pageNum = currentPage - 1 + i;
                            }

                            if (pageNum > 0 && pageNum <= totalPages) {
                              return (
                                <PaginationItem key={pageNum}>
                                  <PaginationLink
                                    onClick={() => setCurrentPage(pageNum)}
                                    isActive={currentPage === pageNum}
                                  >
                                    {pageNum}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            }
                            return null;
                          },
                        )}

                        {/* Ellipsis if needed */}
                        {currentPage < totalPages - 2 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}

                        {/* Last page */}
                        {currentPage < totalPages - 2 && (
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => setCurrentPage(totalPages)}
                            >
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        )}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
                            aria-disabled={currentPage === totalPages}
                            className={
                              currentPage === totalPages
                                ? 'pointer-events-none opacity-50'
                                : ''
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Order Confirmation Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {orderToCancel && (
            <div className="py-3">
              <div className="mb-4 p-3 bg-muted rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Order Number:</span>
                  <span>{orderToCancel.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Order Date:</span>
                  <span>{formatDate(orderToCancel.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span>{formatCurrency(orderToCancel.total)}</span>
                </div>
              </div>

              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  You can only cancel orders that are still awaiting payment.
                  Once an order is being processed, it cannot be cancelled.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCancelModalOpen(false)}
              disabled={isProcessing}
            >
              Keep Order
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
              )}
              {isProcessing ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MaxWidthWrapper>
  );
}
