'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
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

interface CategorySalesChartProps {
  month: string;
  year: string;
  onMonthChange: (m: string) => void;
  onYearChange: (y: string) => void;
  isSmall: boolean;
}

const categoryData = [
  { category: 'Buah & Sayur', total: 8245300, color: '#10B981' },
  { category: 'Susu & Telor', total: 6128750, color: '#2563eb' },
  { category: 'Roti', total: 4982200, color: '#F59E0B' },
  { category: 'Daging', total: 3245800, color: '#EF4444' },
  { category: 'Lainnya', total: 2178450, color: '#6B7280' },
];

export default function CategorySalesChart({
  month,
  year,
  onMonthChange,
  onYearChange,
  isSmall,
}: CategorySalesChartProps) {
  return (
    <ChartContainer
      config={{ total: { label: 'Penjualan per Kategori', color: '#2563eb' } }}
      className="w-full h-[500px] rounded-xl border bg-white px-6 py-4 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Penjualan per Kategori</h2>
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

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={categoryData}
          margin={{ bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `Rp ${v.toLocaleString('id-ID')}`}
          />
          <YAxis
            type="category"
            dataKey="category"
            axisLine={false}
            tickLine={false}
            width={isSmall ? 100 : 120}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="total" barSize={20} radius={[10, 10, 10, 10]}>
            {categoryData.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
