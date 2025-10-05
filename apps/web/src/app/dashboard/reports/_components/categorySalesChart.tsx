'use client';

import React, { useEffect, useState } from 'react';
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
import reportManagementAPI from '@/lib/apis/dashboard/reportManagement.api';
import CategorySalesChartSkeleton from './categorySalesChartSkeleton';
import storeManagementAPI from '@/lib/apis/dashboard/storeManagement.api';
import { useSession } from '@/lib/auth/client';

interface CategorySalesChartProps {
  month: string;
  year: string;
  onMonthChange: (m: string) => void;
  onYearChange: (y: string) => void;
  isSmall: boolean;
}

interface CategorySalesChartProps {
  month: string;
  year: string;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
}
export default function CategorySalesChart({
  month,
  year,
  onMonthChange,
  onYearChange,
  isSmall,
}: CategorySalesChartProps) {
  const { fetchCategorySales, categorySales, isLoading } =
    reportManagementAPI();
  const { fetchStores, stores } = storeManagementAPI();
  const [selectedStore, setSelectedStore] = useState('all');
  const { data: session, isPending: isSessionLoading } = useSession();
  const user = session?.user;
  if (isSessionLoading) {
    return <div></div>;
  }

  if (!user) return <div></div>;
  useEffect(() => {
    fetchCategorySales(year, month, selectedStore);
    fetchStores();
  }, [year, month, selectedStore]);
  if (isLoading) {
    return <CategorySalesChartSkeleton />;
  }
  return (
    <ChartContainer
      config={{ total: { label: 'Penjualan per Kategori', color: '#2563eb' } }}
      className="w-full h-[500px] rounded-xl border bg-white sm:px-6 sm:py-10 pb-40 px-4 pt-4 sm:pt-0 sm:pb-0 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Penjualan per Kategori</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          {user.role == 'SUPER' && (
            <Select value={selectedStore} onValueChange={setSelectedStore}>
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
                <SelectItem value="2016">2016</SelectItem>
                <SelectItem value="2017">2017</SelectItem>
                <SelectItem value="2018">2018</SelectItem>
                <SelectItem value="2019">2019</SelectItem>
                <SelectItem value="2020">2020</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          </div>
          
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={categorySales}
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
            {categorySales.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
