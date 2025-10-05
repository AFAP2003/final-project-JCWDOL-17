import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StockReportSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton key={idx} className="h-24 w-full rounded-lg" />
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border border-gray-200 bg-white overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                'Produk',
                'Stok Awal',
                'Tambahan',
                'Pengurangan',
                'Stok Akhir',
              ].map((_, i) => (
                <th
                  key={i}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-500"
                >
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: 3 }).map((_, row) => (
              <tr key={row}>
                {Array.from({ length: 5 }).map((_, cell) => (
                  <td key={cell} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-6 w-32" />
            </div>
    </div>
  );
}
