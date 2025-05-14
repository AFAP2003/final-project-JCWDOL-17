'use client';
import { useState } from 'react';
import { useOrderManagement } from '@/hooks/useOrderManagement';

import OrderManagementFilter from './_component/orderManagementFilter';
import OrderManagementTable from './_component/orderManagementTable';
import OrderManagementPagination from './_component/orderManagementPagination';
import OrderManagementSkeleton from './_component/orderManagementSkeleton';
import OrderDetailModal from './_component/orderDetailModal';
import PaymentConfirmationModal from './_component/paymentConfirmationModal';
import ShipOrderModal from './_component/shipOrderModal';
import CancelOrderModal from './_component/cancelOrderModal';

export default function OrderManagement() {
  const {
    isLoading,
    orders,
    table,
    columns,
    globalFilter,
    handleSearchChange,
    handleStatusFilter,
    handleWarehouseFilter,
    handleDateRangeFilter,
    pagination,
    setPagination,
    warehouses,
  } = useOrderManagement();

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [paymentConfirmationOpen, setPaymentConfirmationOpen] = useState(false);
  const [shipOrderOpen, setShipOrderOpen] = useState(false);
  const [cancelOrderOpen, setCancelOrderOpen] = useState(false);

  // Modal handlers
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
  };

  const handleConfirmPayment = (order) => {
    setSelectedOrder(order);
    setPaymentConfirmationOpen(true);
  };

  const handleShipOrder = (order) => {
    setSelectedOrder(order);
    setShipOrderOpen(true);
  };

  const handleCancelOrder = (order) => {
    setSelectedOrder(order);
    setCancelOrderOpen(true);
  };

  if (isLoading) {
    return <OrderManagementSkeleton />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col gap-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="sm:text-4xl text-2xl font-bold">Manajemen Pesanan</h1>
      </div>

      {/* Filter row */}
      <OrderManagementFilter
        globalFilter={globalFilter}
        handleSearchChange={handleSearchChange}
        handleStatusFilter={handleStatusFilter}
        handleWarehouseFilter={handleWarehouseFilter}
        handleDateRangeFilter={handleDateRangeFilter}
        table={table}
        warehouses={warehouses}
      />

      {/* Main table */}
      <OrderManagementTable
        table={table}
        columns={columns}
        onViewOrder={handleViewOrder}
        onConfirmPayment={handleConfirmPayment}
        onShipOrder={handleShipOrder}
        onCancelOrder={handleCancelOrder}
      />

      {/* Pagination */}
      <OrderManagementPagination
        table={table}
        pagination={pagination}
        setPagination={setPagination}
      />

      {/* Modals */}
      <OrderDetailModal
        order={selectedOrder}
        open={orderDetailOpen}
        onOpenChange={setOrderDetailOpen}
      />

      <PaymentConfirmationModal
        order={selectedOrder}
        open={paymentConfirmationOpen}
        onOpenChange={setPaymentConfirmationOpen}
      />

      <ShipOrderModal
        order={selectedOrder}
        open={shipOrderOpen}
        onOpenChange={setShipOrderOpen}
      />

      <CancelOrderModal
        order={selectedOrder}
        open={cancelOrderOpen}
        onOpenChange={setCancelOrderOpen}
      />
    </div>
  );
}
