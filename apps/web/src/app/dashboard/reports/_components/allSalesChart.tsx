'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  ChartContainer,
  ChartConfig,
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

interface AllSalesChartProps {
  year: string;
  onYearChange: (year: string) => void;
}

const salesData = [
  { month: 'Jan', total: 1200000 },
  { month: 'Feb', total: 1550000 },
  { month: 'Mar', total: 670000 },
  { month: 'Apr', total: 0 },
  { month: 'Mei', total: 0 },
  { month: 'Jun', total: 0 },
  { month: 'Jul', total: 0 },
  { month: 'Agu', total: 0 },
  { month: 'Sep', total: 0 },
  { month: 'Okt', total: 0 },
  { month: 'Nov', total: 0 },
  { month: 'Des', total: 0 },
];

const chartConfig: ChartConfig = {
  total: { label: 'Total Penjualan', color: '#2563eb' },
};

export default function AllSalesChart({
  year,
  onYearChange,
}: AllSalesChartProps) {
  return (
    <ChartContainer
      config={chartConfig}
      className="w-full h-[500px] rounded-xl border bg-white px-6 py-4 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Penjualan</h2>
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
      <BarChart
        data={salesData}
        barSize={24}
        margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          width={70}
          tickFormatter={(value) =>
            value === 0 ? '0' : `${Number(value).toLocaleString('id-ID')}`
          }
          fontSize={12}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
