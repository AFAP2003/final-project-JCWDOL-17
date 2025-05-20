'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import AllSalesChart from './_components/allSalesChart';
import CategorySalesChart from './_components/categorySalesChart';
import ProductSalesChart from './_components/productSalesChart';
import StockReport from './_components/stockReport';

export default function Page() {
  const [activeTab, setActiveTab] = useState<
    'all' | 'category' | 'product' | 'stock'
  >('all');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('1');
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const onResize = () => setIsSmallScreen(window.innerWidth < 640);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="w-full p-6 sm:p-0">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mb-4"
      >
        {/* Tab navigation */}
        <div className="mb-4">
          {/* small‐screen dropdown */}
          <div className="block sm:hidden mb-2">
            <Select defaultValue={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Laporan" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Pilih Laporan</SelectLabel>
                  <SelectItem value="all">Penjualan Keseluruhan</SelectItem>
                  <SelectItem value="category">Per Kategori</SelectItem>
                  <SelectItem value="product">Per Produk</SelectItem>
                  <SelectItem value="stock">Stok</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {/* large‐screen tabs */}
          <div className="hidden sm:flex">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                Penjualan Keseluruhan
              </TabsTrigger>
              <TabsTrigger value="category" className="flex-1">
                Per Kategori
              </TabsTrigger>
              <TabsTrigger value="product" className="flex-1">
                Per Produk
              </TabsTrigger>
              <TabsTrigger value="stock" className="flex-1">
                Stok
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* ----------- CONTENT PANES ----------- */}
        <TabsContent value="all">
          <AllSalesChart year={selectedYear} onYearChange={setSelectedYear} />
        </TabsContent>

        <TabsContent value="category">
          <CategorySalesChart
            month={selectedMonth}
            year={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            isSmall={isSmallScreen}
          />
        </TabsContent>

        <TabsContent value="product">
          <ProductSalesChart
            month={selectedMonth}
            year={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        </TabsContent>

        <TabsContent value="stock">
          <StockReport
            month={selectedMonth}
            year={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
