/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { apiclient } from '@/lib/apiclient';
import { refetchNow } from '@/lib/tanstack-query';
import { cn } from '@/lib/utils';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { useMutation } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit, Eye, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type DataColumnType = {
  storeId: string;
  name: string;
  address: string;
  city: string;
  admin: string;
  status: boolean;
};

export const columns: ColumnDef<DataColumnType>[] = [
  {
    accessorKey: 'name',
    enableGlobalFilter: true,
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return (
        <div
          onClick={() => column.toggleSorting(isSorted === 'asc')}
          className="flex cursor-pointer"
        >
          Nama Toko
          <ArrowUpDown
            className={cn(
              'ml-2 h-4 w-4 text-gray-700 opacity-0',
              isSorted && 'opacity-100',
            )}
          />
        </div>
      );
    },
  },
  {
    accessorKey: 'address',
    enableGlobalFilter: true,
    size: 320,
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return (
        <div
          onClick={() => column.toggleSorting(isSorted === 'asc')}
          className="flex cursor-pointer"
        >
          Alamat
          <ArrowUpDown
            className={cn(
              'ml-2 h-4 w-4 text-gray-700 opacity-0',
              isSorted && 'opacity-100',
            )}
          />
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="line-clamp-1">{row.getValue('address')}</div>
            </TooltipTrigger>
            <TooltipContent
              className="max-sm:max-w-[280px]"
              align="center"
              side="bottom"
            >
              <div className="">{row.getValue('address')}</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: 'city',
    enableGlobalFilter: true,
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return (
        <div
          onClick={() => column.toggleSorting(isSorted === 'asc')}
          className="flex cursor-pointer"
        >
          Kota
          <ArrowUpDown
            className={cn(
              'ml-2 h-4 w-4 text-gray-700 opacity-0',
              isSorted && 'opacity-100',
            )}
          />
        </div>
      );
    },
  },
  {
    accessorKey: 'admin',
    enableGlobalFilter: true,
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return (
        <div
          onClick={() => column.toggleSorting(isSorted === 'asc')}
          className="flex cursor-pointer"
        >
          Admin
          <ArrowUpDown
            className={cn(
              'ml-2 h-4 w-4 text-gray-700 opacity-0',
              isSorted && 'opacity-100',
            )}
          />
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    size: 70,
    header: ({ column }) => {
      const isSorted = column.getIsSorted();

      return (
        <div
          onClick={() => column.toggleSorting(isSorted === 'asc')}
          className="flex cursor-pointer"
        >
          Status
          <ArrowUpDown
            className={cn(
              'ml-2 h-4 w-4 text-gray-700 opacity-0',
              isSorted && 'opacity-100',
            )}
          />
        </div>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue<boolean>('status');
      const label = value ? 'Active' : 'Inactive';
      const [open, setOpen] = useState(false);

      const storeid = row.original.storeId;
      const { mutate, isPending } = useMutation({
        mutationFn: async (status: boolean) => {
          console.log({ status, storeid });
          return await apiclient.patch('/store/status', {
            storeId: storeid,
            status: status,
          });
        },
        onSuccess: () => {
          refetchNow(['all:store']);
        },
        onError: () => {
          toast({
            description:
              'Sorry we have problem in our server. Please try again later',
            variant: 'destructive',
          });
        },
      });

      return (
        <div className="flex gap-1 items-center">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger disabled={isPending}>
              <div
                className={cn(
                  'py-1 flex justify-center items-center text-xs rounded-lg font-semibold w-[60px] hover:opacity-90 transition-all',
                  value
                    ? 'bg-green-600 text-neutral-200'
                    : 'bg-red-600 text-neutral-200',
                )}
              >
                {isPending ? '...' : label}
              </div>
            </DialogTrigger>
            <DialogContent className="bg-neutral-200 max-w-[230px]">
              <DialogHeader className="space-y-1">
                <DialogTitle className="font-semibold text-lg pb-0 mb-0">
                  Ubah Status
                </DialogTitle>
                <DialogDescription className="text-sm text-neutral-500 mt-0">
                  {row.getValue('name')}
                </DialogDescription>
              </DialogHeader>

              <div className="w-full flex justify-center items-center gap-3">
                <Button
                  onClick={() => {
                    mutate(true);
                    setOpen(false);
                  }}
                  className="bg-green-600 hover:bg-green-600 text-neutral-200 hover:bg-green-600/95 border-green-700 transition-all duration-300"
                >
                  Active
                </Button>
                <Button
                  onClick={() => {
                    mutate(false);
                    setOpen(false);
                  }}
                  className="bg-red-600 hover:bg-red-600 text-neutral-200 hover:bg-red-600/95 border-red-700 transition-all duration-300"
                >
                  Inactive
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableResizing: false,
    size: 70, //starting column size
    header: ({ column }) => {
      return <div className="text-center">Aksi</div>;
    },
    cell: ({ row }) => {
      const router = useRouter();

      const storeid = row.original.storeId;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="w-full mx-auto">
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                refetchNow(['all:available:admin']);
                router.push(`/dashboard/stores/${storeid}`);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              Lihat Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/stores/configure?storeId=${storeid}`)
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
