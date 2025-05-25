import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { flexRender } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, TruckIcon, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import {
  Order,
  OrderManagementTableProps,
  OrderStatus,
} from '@/lib/interfaces/orders';
import { PaymentStatus } from '@/lib/enums';
import { paymentStatusStyles, statusStyles } from '@/lib/constants/order';

export default function OrderManagementTable({
  table,
  columns,
  onViewOrder,
  onConfirmPayment,
  onShipOrder,
  onCancelOrder,
}: OrderManagementTableProps) {
  const renderStatusBadge = (status: OrderStatus) => {
    const style = statusStyles[status] || { variant: 'default', label: status };
    return <Badge variant={style.variant as any}>{style.label}</Badge>;
  };

  const renderPaymentStatusBadge = (status: PaymentStatus) => {
    const style = paymentStatusStyles[status] || {
      variant: 'default',
      label: status,
    };
    return <Badge variant={style.variant as any}>{style.label}</Badge>;
  };

  const getAvailableActions = (order: Order) => {
    const actions = [];

    actions.push({
      label: 'Lihat Detail',
      icon: Eye,
      onClick: () => onViewOrder(order),
      disabled: false,
    });

    if (order.status === 'WAITING_PAYMENT_CONFIRMATION') {
      actions.push({
        label: 'Konfirmasi Pembayaran',
        icon: CheckCircle,
        onClick: () => onConfirmPayment(order),
        disabled: false,
      });
    }

    if (order.status === 'PROCESSING') {
      actions.push({
        label: 'Kirim Pesanan',
        icon: TruckIcon,
        onClick: () => onShipOrder(order),
        disabled: false,
      });
    }

    if (
      [
        'WAITING_PAYMENT',
        'WAITING_PAYMENT_CONFIRMATION',
        'PROCESSING',
      ].includes(order.status)
    ) {
      actions.push({
        label: 'Batalkan Pesanan',
        icon: XCircle,
        onClick: () => onCancelOrder(order),
        disabled: false,
        destructive: true,
      });
    }

    return actions;
  };

  return (
    <div className="rounded-md border border-gray-200 overflow-x-auto w-full">
      <Table className="min-w-full">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={
                    header.column.getCanSort()
                      ? header.column.getToggleSortingHandler()
                      : undefined
                  }
                  className="cursor-pointer select-none whitespace-nowrap"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                  {{ asc: ' 🔼', desc: ' 🔽' }[
                    header.column.getIsSorted() as string
                  ] ?? null}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  if (cell.column.id === 'status') {
                    return (
                      <TableCell key={cell.id}>
                        {renderStatusBadge(cell.getValue() as OrderStatus)}
                      </TableCell>
                    );
                  }

                  if (cell.column.id === 'paymentStatus') {
                    return (
                      <TableCell key={cell.id}>
                        {renderPaymentStatusBadge(
                          cell.getValue() as PaymentStatus,
                        )}
                      </TableCell>
                    );
                  }

                  if (cell.column.id === 'actions') {
                    const order = row.original;
                    const actions = getAvailableActions(order);

                    return (
                      <TableCell key={cell.id}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                              {actions.map((action, index) => (
                                <DropdownMenuItem
                                  key={index}
                                  onClick={action.onClick}
                                  disabled={action.disabled}
                                  className={
                                    action.destructive ? 'text-red-600' : ''
                                  }
                                >
                                  <action.icon className="mr-2 h-4 w-4" />
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    );
                  }

                  return (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Tidak ada data pesanan.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
