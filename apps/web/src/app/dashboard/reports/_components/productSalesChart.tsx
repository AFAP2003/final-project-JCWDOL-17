'use client';

import React, { useEffect, useState } from 'react';
import { ChartContainer, ChartConfig } from '@/components/ui/chart';
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
import ProductSalesChartSkeleton from './productSalesChartSkeleton';
import storeManagementAPI from '@/lib/apis/dashboard/storeManagement.api';
import { useSession } from '@/lib/auth/client';



interface ProductSalesChartProps {
  month: string;
  year: string;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
}

const chartConfig: ChartConfig = {
  total: { label: 'Penjualan Terlaris', color: '#2563eb' },
};

export default function ProductSalesChart({
  month,
  year,
  onMonthChange,
  onYearChange,
}: ProductSalesChartProps) {
  const { fetchProductSales, productSales, isLoading } = reportManagementAPI();
  const { fetchStores, stores } = storeManagementAPI();
  const [selectedStore, setSelectedStore] = useState('all');
  const { data: session, isPending: isSessionLoading } = useSession();
  const user = session?.user;
  if (isSessionLoading) {
    return <div></div>;
  }

  if (!user) return <div></div>;
  useEffect(() => {
    fetchProductSales(year, month, selectedStore);
    fetchStores();
  }, [year, month, selectedStore]);

  if (isLoading) {
    return <ProductSalesChartSkeleton />;
  }
  return (
    <ChartContainer
      config={chartConfig}
      className="w-full min-h-[500px] rounded-xl border bg-white sm:px-6 px-4 py-4 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Penjualan Terlaris</h2>
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

      {productSales.map((item, idx) => (
        <div key={item.id} className="flex items-center justify-between mb-3">
          <div>
            <p className="font-medium text-sm">
              #{idx + 1} {item.product}
            </p>
            <p className="text-sm text-gray-600">
              {item.unitsSold} Produk Terjual
            </p>
          </div>
          <p className="font-medium text-sm">
            Rp{' '}
            {item.revenue.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
          </p>
        </div>
      ))}
    </ChartContainer>
  );
}
