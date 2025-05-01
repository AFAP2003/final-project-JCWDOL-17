'use client';

import React from 'react';
import {
  ChartContainer,
  ChartConfig,
} from '@/components/ui/chart';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

interface StockRecord {
  product: string;
  opening: number;
  added: number;
  removed: number;
  closing: number;
}

interface StockReportProps {
  month: string;
  year: string;
  onMonthChange: (m: string) => void;
  onYearChange: (y: string) => void;
}

const stockData: StockRecord[] = [
  { product: 'Sunmi Beras Putih Premium 5 kg', opening: 145, added: 65, removed: 42, closing: 168 },
  { product: 'Hati Ayam Organik Hona Farm',       opening: 96,  added: 35, removed: 10, closing: 121 },
  { product: 'Healthy Republic Bumbu Marinasi Rendang 120 gram', opening: 76, added: 45, removed: 38, closing: 83 },
];

const totalProducts = 1198;
const stockAdded    = 2120;
const stockRemoved  = 1645;

const chartConfig: ChartConfig = {
  total: { label: 'Ringkasan Stok', color: '#2563eb' },
};

export default function StockReport({
  month,
  year,
  onMonthChange,
  onYearChange,
}: StockReportProps) {
  return (
    <>
      <ChartContainer
        config={chartConfig}
        className="w-full sm:h-[250px] h-[450px] rounded-xl border bg-white sm:px-6 py-4 shadow-sm p-4"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ringkasan Stok</h2>
          <div className="flex flex-col sm:flex-row gap-4">
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
                    'januari','februari','maret','april','mei','juni',
                    'juli','agustus','september','oktober','november','desember',
                  ].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

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

        <div className="sm:grid grid-cols-3 flex flex-col gap-4 mb-4">
          <div className="p-4 rounded bg-gray-50 border text-center">
            <p className="text-2xl font-bold">{totalProducts.toLocaleString('en-US')}</p>
            <p className="text-sm text-gray-600">Total Produk</p>
          </div>
          <div className="p-4 rounded bg-gray-50 border text-center">
            <p className="text-2xl font-bold text-green-600">
              +{stockAdded.toLocaleString('en-US')}
            </p>
            <p className="text-sm text-gray-600">Tambahan Stok</p>
          </div>
          <div className="p-4 rounded bg-gray-50 border text-center">
            <p className="text-2xl font-bold text-red-600">
              -{stockRemoved.toLocaleString('en-US')}
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
            {stockData.map((item, idx) => (
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
    </>
  );
}
