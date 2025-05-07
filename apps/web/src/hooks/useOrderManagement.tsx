import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table';
import { apiclient } from '@/lib/apiclient';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

export function useOrderManagement() {
  const { toast } = useToast();

  // Table state
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(
    null,
  );

  // Fetch orders
  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: [
      'orders',
      statusFilter,
      warehouseFilter,
      dateRange,
      pagination.pageIndex,
      pagination.pageSize,
    ],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', (pagination.pageIndex + 1).toString());
      queryParams.append('limit', pagination.pageSize.toString());

      if (statusFilter !== 'all') {
        queryParams.append('status', statusFilter);
      }

      if (warehouseFilter !== 'all') {
        queryParams.append('storeId', warehouseFilter);
      }

      if (dateRange) {
        queryParams.append(
          'startDate',
          dateRange.from.toISOString().split('T')[0],
        );
        queryParams.append('endDate', dateRange.to.toISOString().split('T')[0]);
      }

      const response = await apiclient.get(`/order?${queryParams.toString()}`);
      return response.data;
    },
  });

  // Fetch warehouses/stores
  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const response = await apiclient.get('/dashboard/stores');
      return response.data.data;
    },
  });

  const warehouses = warehousesData || [];
  const orders = ordersData?.data || [];
  const isLoading = isOrdersLoading;

  // Table columns definition
  const columns = useMemo(
    () => [
      {
        accessorKey: 'orderNumber',
        header: 'No. Pesanan',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'user.name',
        header: 'Pelanggan',
        cell: (info) => info.getValue() || '-',
      },
      {
        accessorKey: 'store.name',
        header: 'Gudang',
        cell: (info) => info.getValue() || '-',
      },
      {
        accessorKey: 'createdAt',
        header: 'Tanggal',
        cell: (info) => {
          const date = info.getValue();
          return date
            ? format(new Date(date), 'dd MMM yyyy', { locale: id })
            : '-';
        },
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: (info) => formatCurrency(info.getValue()),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          return renderStatusBadge(status);
        },
      },
      {
        accessorKey: 'paymentStatus',
        header: 'Pembayaran',
        cell: (info) => {
          const status = info.getValue();
          return renderPaymentStatusBadge(status);
        },
      },
      {
        accessorKey: 'actions',
        header: 'Aksi',
        enableSorting: false,
      },
    ],
    [],
  );

  // Status badge helper
  const renderStatusBadge = (status) => {
    const statusMap = {
      WAITING_PAYMENT: { variant: 'outline', label: 'Menunggu Pembayaran' },
      WAITING_PAYMENT_CONFIRMATION: {
        variant: 'secondary',
        label: 'Menunggu Konfirmasi',
      },
      PROCESSING: { variant: 'default', label: 'Diproses' },
      SHIPPED: { variant: 'info', label: 'Dikirim' },
      CONFIRMED: { variant: 'success', label: 'Selesai' },
      CANCELLED: { variant: 'destructive', label: 'Dibatalkan' },
    };

    const style = statusMap[status] || { variant: 'default', label: status };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  // Payment status badge helper
  const renderPaymentStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'outline', label: 'Tertunda' },
      PAID: { variant: 'success', label: 'Lunas' },
      FAILED: { variant: 'destructive', label: 'Gagal' },
      REFUNDED: { variant: 'warning', label: 'Dikembalikan' },
    };

    const style = statusMap[status] || { variant: 'default', label: status };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  // Handle filters
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilter(e.target.value);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
  };

  const handleWarehouseFilter = (value: string) => {
    setWarehouseFilter(value);
  };

  const handleDateRangeFilter = (range: { from: Date; to: Date }) => {
    setDateRange(range);
  };

  // Setup table
  const table = useReactTable({
    data: orders,
    columns,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Custom filter function for global search
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase();

      // Search in order number
      if (
        columnId === 'orderNumber' &&
        String(row.getValue('orderNumber')).toLowerCase().includes(searchValue)
      ) {
        return true;
      }

      // Search in customer name
      if (
        columnId === 'user.name' &&
        String(row.getValue('user.name') || '')
          .toLowerCase()
          .includes(searchValue)
      ) {
        return true;
      }

      return false;
    },
  });

  return {
    isLoading,
    orders,
    table,
    columns,
    globalFilter,
    pagination,
    setPagination,
    handleSearchChange,
    handleStatusFilter,
    handleWarehouseFilter,
    handleDateRangeFilter,
    warehouses,
  };
}
