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

interface TopProduct {
  rank: number;
  name: string;
  unitsSold: number;
  revenue: number;
}

interface ProductSalesChartProps {
  month: string;
  year: string;
  onMonthChange: (m: string) => void;
  onYearChange: (y: string) => void;
}

const topProductsData: TopProduct[] = [
  { rank: 1, name: 'Sunmi Beras Putih Premium 5 kg', unitsSold: 716, revenue: 1000000 },
  { rank: 2, name: 'Hati Ayam Organik Hona Farm', unitsSold: 1027, revenue: 2000000 },
  { rank: 3, name: 'Healthy Republic Bumbu Marinasi Rendang 120 gram', unitsSold: 533, revenue: 800000 },
];

const chartConfig: ChartConfig = {
  total: { label: 'Penjualan Terlaris', color: '#2563eb' },
};

export default function ProductSalesChart({
  month,
  year,
  onMonthChange,
  onYearChange,
}: ProductSalesChartProps) {
  return (
    <ChartContainer
      config={chartConfig}
      className="w-full h-[500px] rounded-xl border bg-white px-6 py-4 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Penjualan Terlaris</h2>
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

      {topProductsData.map((item) => (
        <div key={item.rank} className="flex items-center justify-between mb-3">
          <div>
            <p className="font-medium text-sm">
              #{item.rank} {item.name}
            </p>
            <p className="text-sm text-gray-600">{item.unitsSold} Produk Terjual</p>
          </div>
          <p className="font-medium text-sm">
            Rp {item.revenue.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
          </p>
        </div>
      ))}
    </ChartContainer>
  );
}
