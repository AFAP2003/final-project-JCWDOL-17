'use client';

import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import reportManagementAPI from '@/lib/apis/dashboard/reportManagement.api';
import storeManagementAPI from '@/lib/apis/dashboard/storeManagement.api';
import { useEffect, useState } from 'react';
import StockReportSkeleton from './stockReportSkeleton';
import { useSession } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StockReportProps {
  month: string;
  year: string;
  onMonthChange: (m: string) => void;
  onYearChange: (y: string) => void;
}

const chartConfig: ChartConfig = {
  total: { label: 'Ringkasan Stok', color: '#2563eb' },
};

export default function StockReport({
  month,
  year,
  onMonthChange,
  onYearChange,
}: StockReportProps) {
  const {
    isLoading,
    fetchStockReport,
    stockReport,
    pagination,
  } = reportManagementAPI();
  const { fetchStores, stores } = storeManagementAPI();
  const [selectedStore, setSelectedStore] = useState('all');
  const { data: session, isPending: isSessionLoading } = useSession();
  const user = session?.user;
  const [pageIndex, setPageIndex] = useState(1);

  if (isSessionLoading) {
    return <div></div>;
  }

  if (!user) return <div></div>;
  useEffect(() => {
    fetchStockReport(pageIndex, 10, year, month, selectedStore);
    fetchStores();
  }, [year, month, selectedStore, pageIndex]);

  if (isLoading) {
    return <StockReportSkeleton />;
  }

  // Extract summary and details from stockReport
  const summary = stockReport?.summary || {
    totalProducts: 0,
    stockAdded: 0,
    stockRemoved: 0,
  };
  const details = stockReport?.details || [];

  return (
    <>
      <ChartContainer
        config={chartConfig}
        className="w-full sm:h-[250px] h-[500px] rounded-xl border bg-white sm:px-6 py-4 shadow-sm p-4"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ringkasan Stok</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            {user.role == 'SUPER' && (
              <Select
                defaultValue={selectedStore}
                onValueChange={setSelectedStore}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Pilih Toko</SelectLabel>
                    <SelectItem value="all">Semua Toko</SelectItem>
                    {stores.map((store) => (
                      <SelectItem value={store.id} key={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            <div className='flex justify-end'>
            <Select
              defaultValue={month}
              onValueChange={(value) => onMonthChange(value)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder={month} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Pilih Bulan</SelectLabel>
                  {[
                    'januari',
                    'februari',
                    'maret',
                    'april',
                    'mei',
                    'juni',
                    'juli',
                    'agustus',
                    'september',
                    'oktober',
                    'november',
                    'desember',
                  ].map((label, idx) => (
                    <SelectItem key={idx} value={`${idx + 1}`}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            </div>
            
            <div className='flex justify-end'>
              <Select
              defaultValue={year}
              onValueChange={(value) => onYearChange(value)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder={year} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Pilih Tahun</SelectLabel>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            </div>
            
          </div>
        </div>

        <div className="sm:grid grid-cols-3 flex flex-col gap-4 mb-4">
          <div className="p-4 rounded bg-gray-50 border text-center">
            <p className="text-2xl font-bold">
              {summary.totalProducts.toLocaleString('en-US')}
            </p>
            <p className="text-sm text-gray-600">Total Produk</p>
          </div>
          <div className="p-4 rounded bg-gray-50 border text-center">
            <p className="text-2xl font-bold text-green-600">
              +{summary.stockAdded.toLocaleString('en-US')}
            </p>
            <p className="text-sm text-gray-600">Tambahan Stok</p>
          </div>
          <div className="p-4 rounded bg-gray-50 border text-center">
            <p className="text-2xl font-bold text-red-600">
              -{summary.stockRemoved.toLocaleString('en-US')}
            </p>
            <p className="text-sm text-gray-600">Pengurangan Stok</p>
          </div>
        </div>
      </ChartContainer>

      <div className="rounded-md border border-gray-200 overflow-x-auto mt-[50px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead>Stok Awal</TableHead>
              <TableHead>Tambahan</TableHead>
              <TableHead>Pengurangan</TableHead>
              <TableHead>Stok Akhir</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.product}</TableCell>
                <TableCell>{item.opening}</TableCell>
                <TableCell className={item.added > 0 ? 'text-green-600' : ''}>
                  {item.added > 0 ? `+${item.added}` : item.added}
                </TableCell>
                <TableCell className={item.removed > 0 ? 'text-red-600' : ''}>
                  {item.removed > 0 ? `-${item.removed}` : item.removed}
                </TableCell>
                <TableCell>{item.closing}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pageIndex === 1}
            onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={
              !pagination.totalPages || pageIndex === pagination.totalPages
            }
            onClick={() => setPageIndex((p) => p + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="">
          Halaman {pagination.pageIndex} dari {pagination.totalPages || 1}
        </div>
      </div>
    </>
  );
}
