'use client';

import { useEffect, useState, useCallback } from 'react';
import orderManagementAPI from '@/lib/apis/dashboard/orderManagement.api';
import storeManagementAPI from '@/lib/apis/dashboard/storeManagement.api';
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  PaginationState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

import OrderManagementFilter from './_component/orderManagementFilter';
import OrderManagementTable from './_component/orderManagementTable';
import OrderManagementPagination from './_component/orderManagementPagination';
import OrderManagementSkeleton from './_component/orderManagementSkeleton';
import OrderDetailModal from './_component/orderDetailModal';
import PaymentConfirmationModal from './_component/paymentConfirmationModal';
import ShipOrderModal from './_component/shipOrderModal';
import CancelOrderModal from './_component/cancelOrderModal';
import { Order } from '@/lib/interfaces/orders';

export default function OrderManagement() {
  const {
    orders,
    isLoading,
    fetchOrders,
    handleVerifyPayment,
    handleShipOrder,
    handleCancelOrder,
    checkOrderStock,
  } = orderManagementAPI();

  const { stores, fetchStores } = storeManagementAPI();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [paymentConfirmationOpen, setPaymentConfirmationOpen] = useState(false);
  const [shipOrderOpen, setShipOrderOpen] = useState(false);
  const [cancelOrderOpen, setCancelOrderOpen] = useState(false);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [stockCheckLoading, setStockCheckLoading] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Order Number',
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue('orderNumber')}</span>
      ),
    },
    {
      accessorKey: 'user.name',
      header: 'Customer',
      cell: ({ row }) => {
        const user = row.original.user;
        return user ? user.name : 'Unknown';
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) =>
        format(new Date(row.getValue('createdAt')), 'dd/MM/yyyy HH:mm'),
      sortingFn: 'datetime',
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => formatCurrency(row.getValue('total')),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      filterFn: 'equals',
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Payment',
      filterFn: 'equals',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => null,
    },
  ];

  const table = useReactTable({
    data: orders || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      pagination,
      globalFilter,
    },
    onSortingChange: setSorting,
    manualPagination: true,
    pageCount: -1,
  });

  useEffect(() => {
    const loadData = async () => {
      await fetchOrders(pagination.pageIndex, pagination.pageSize, {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        storeId: warehouseFilter !== 'all' ? warehouseFilter : undefined,
        startDate: dateRange.from,
        endDate: dateRange.to,
        orderNumber: globalFilter || undefined,
      });
    };

    loadData();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    statusFilter,
    warehouseFilter,
    dateRange,
    globalFilter,
  ]);

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setGlobalFilter(e.target.value);
    },
    [],
  );

  const handleStatusFilter = useCallback((value: string) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleWarehouseFilter = useCallback((value: string) => {
    setWarehouseFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleDateRangeFilter = useCallback(
    (range: { from: Date; to: Date }) => {
      setDateRange(range);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    [],
  );

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
  };

  const handleConfirmPayment = (order: Order) => {
    setSelectedOrder(order);
    setPaymentConfirmationOpen(true);
  };

  const handleShipOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setShipOrderOpen(true);
  };

  const handleCancelOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setCancelOrderOpen(true);
  };

  const onVerifyPayment = async (
    orderId: string,
    paymentProofId: string,
    approved: boolean,
    notes: string,
  ) => {
    setActionsLoading(true);
    try {
      await handleVerifyPayment(orderId, paymentProofId, approved, notes);

      await fetchOrders(pagination.pageIndex, pagination.pageSize, {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        storeId: warehouseFilter !== 'all' ? warehouseFilter : undefined,
        startDate: dateRange.from,
        endDate: dateRange.to,
        orderNumber: globalFilter || undefined,
      });
      return true;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    } finally {
      setActionsLoading(false);
    }
  };

  const onShipOrder = async (
    orderId: string,
    trackingNumber: string,
    notes?: string,
  ) => {
    setActionsLoading(true);
    try {
      await handleShipOrder(orderId, trackingNumber, notes);

      await fetchOrders(pagination.pageIndex, pagination.pageSize, {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        storeId: warehouseFilter !== 'all' ? warehouseFilter : undefined,
        startDate: dateRange.from,
        endDate: dateRange.to,
        orderNumber: globalFilter || undefined,
      });
      return true;
    } catch (error) {
      console.error('Error shipping order:', error);
      return false;
    } finally {
      setActionsLoading(false);
    }
  };

  const onCancelOrder = async (orderId: string, reason: string) => {
    setActionsLoading(true);
    try {
      await handleCancelOrder(orderId, reason);

      await fetchOrders(pagination.pageIndex, pagination.pageSize, {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        storeId: warehouseFilter !== 'all' ? warehouseFilter : undefined,
        startDate: dateRange.from,
        endDate: dateRange.to,
        orderNumber: globalFilter || undefined,
      });
      return true;
    } catch (error) {
      console.error('Error cancelling order:', error);
      return false;
    } finally {
      setActionsLoading(false);
    }
  };

  const onCheckStock = async (orderId: string) => {
    setStockCheckLoading(true);
    try {
      const stockData = await checkOrderStock(orderId);
      return stockData;
    } catch (error) {
      console.error('Error checking stock:', error);
      return null;
    } finally {
      setStockCheckLoading(false);
    }
  };

  if (isLoading && orders.length === 0) {
    return <OrderManagementSkeleton />;
  }

  const warehousesForFilter = (stores || []).map((store) => ({
    id: store.id,
    name: store.name,
  }));

  return (
    <div className="min-h-screen w-full flex flex-col gap-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="sm:text-4xl text-2xl font-bold">Manajemen Pesanan</h1>
      </div>

      <OrderManagementFilter
        globalFilter={globalFilter}
        handleSearchChange={handleSearchChange}
        handleStatusFilter={handleStatusFilter}
        handleWarehouseFilter={handleWarehouseFilter}
        handleDateRangeFilter={handleDateRangeFilter}
        table={table}
        warehouses={warehousesForFilter}
      />

      <OrderManagementTable
        table={table}
        columns={columns}
        onViewOrder={handleViewOrder}
        onConfirmPayment={handleConfirmPayment}
        onShipOrder={handleShipOrderModal}
        onCancelOrder={handleCancelOrderModal}
      />

      <OrderManagementPagination
        table={table}
        pagination={pagination}
        setPagination={setPagination}
      />

      <OrderDetailModal
        order={selectedOrder}
        open={orderDetailOpen}
        onOpenChange={setOrderDetailOpen}
      />

      <PaymentConfirmationModal
        order={selectedOrder}
        open={paymentConfirmationOpen}
        onOpenChange={setPaymentConfirmationOpen}
        onConfirm={onVerifyPayment}
        isPending={actionsLoading}
        onSuccess={() => {
          setPaymentConfirmationOpen(false);
          fetchOrders(pagination.pageIndex, pagination.pageSize);
        }}
      />

      <ShipOrderModal
        order={selectedOrder}
        open={shipOrderOpen}
        onOpenChange={setShipOrderOpen}
        isPending={actionsLoading}
        onSuccess={() => {
          setShipOrderOpen(false);
          fetchOrders(pagination.pageIndex, pagination.pageSize);
        }}
      />

      <CancelOrderModal
        order={selectedOrder}
        open={cancelOrderOpen}
        onOpenChange={setCancelOrderOpen}
        onCanceled={() => {
          setCancelOrderOpen(false);
          fetchOrders(pagination.pageIndex, pagination.pageSize);
        }}
      />
    </div>
  );
}
