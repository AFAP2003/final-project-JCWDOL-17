'use client';

import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/tabs';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/select';
import {
  ChartContainer,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/shadcn/chart';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/shadcn/table';

export default function MonthlySalesChart() {
  // Active tab state (used by both tabs list and dropdown)
  const [activeTab, setActiveTab] = useState('all');

  // Year selection state (for the select dropdown inside charts)
  const [selectedYear, setSelectedYear] = useState('2025');
  // Month selection state, defaulting to "januari"
  const [selectedMonth, setSelectedMonth] = useState('januari');

  // Responsive screen state for category tab adjustments
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // 1) Data for "Laporan Penjualan Keseluruhan"
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

  // 2) Data for "Laporan Penjualan per Kategori"
  const categoryData = [
    { category: 'Buah & Sayur', total: 8245300, color: '#10B981' },
    { category: 'Susu & Telor', total: 6128750, color: '#2563eb' },
    { category: 'Roti', total: 4982200, color: '#F59E0B' },
    { category: 'Daging', total: 3245800, color: '#EF4444' },
    { category: 'Lainnya', total: 2178450, color: '#6B7280' },
  ];

  // 3) Data for "Laporan Penjualan per Produk" (Top Selling Products)
  const topProductsData = [
    { rank: 1, name: 'Sunmi Beras Putih Premium 5 kg', unitsSold: 716, revenue: 1000000 },
    { rank: 2, name: 'Hati Ayam Organik Hona Farm', unitsSold: 1027, revenue: 2000000 },
    { rank: 3, name: 'Healthy Republic Bumbu Marinasi Rendang 120 gram', unitsSold: 533, revenue: 800000 },
  ];

  // 4) Data for "Laporan Stok"
  const totalProducts = 1198;
  const stockAdded = 2120;
  const stockRemoved = 1645;
  const stockData = [
    { product: 'Sunmi Beras Putih Premium 5 kg', opening: 145, added: 65, removed: 42, closing: 168 },
    { product: 'Hati Ayam Organik Hona Farm', opening: 96, added: 35, removed: 10, closing: 121 },
    { product: 'Healthy Republic Bumbu Marinasi Rendang 120 gram', opening: 76, added: 45, removed: 38, closing: 83 },
  ];

  const chartConfig: ChartConfig = {
    total: {
      label: 'Total Penjualan',
      color: '#2563eb',
    },
  };

  return (
    <div className="w-full p-6 sm:p-0">
      {/* Tabs to control which chart is displayed */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="mb-4">
          {/* Dropdown for small screens */}
          <div className="block sm:hidden mb-2">
            <Select defaultValue={activeTab} onValueChange={(value) => setActiveTab(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Laporan" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Pilih Laporan</SelectLabel>
                  <SelectItem value="all">Laporan Penjualan Keseluruhan</SelectItem>
                  <SelectItem value="category">Laporan Penjualan per Kategori</SelectItem>
                  <SelectItem value="product">Laporan Penjualan per Produk</SelectItem>
                  <SelectItem value="stock">Laporan Stok</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {/* TabsList for larger screens */}
          <div className="hidden sm:flex">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                Laporan Penjualan Keseluruhan
              </TabsTrigger>
              <TabsTrigger value="category" className="flex-1">
                Laporan Penjualan per Kategori
              </TabsTrigger>
              <TabsTrigger value="product" className="flex-1">
                Laporan Penjualan per Produk
              </TabsTrigger>
              <TabsTrigger value="stock" className="flex-1">
                Laporan Stok
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* ---------- TAB #1: Laporan Penjualan Keseluruhan ---------- */}
        <TabsContent value="all" className="w-full">
          <ChartContainer
            config={chartConfig}
            className="w-full h-[500px] rounded-xl border bg-white px-6 py-4 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Penjualan</h2>
              <Select onValueChange={(value) => setSelectedYear(value)} defaultValue={selectedYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder={selectedYear} />
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
            <BarChart data={salesData} barSize={24} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={70}
                tickFormatter={(value) => (value === 0 ? '0' : `${Number(value).toLocaleString('id-ID')}`)}
                fontSize={12}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </TabsContent>

        {/* ---------- TAB #2: Laporan Penjualan per Kategori ---------- */}
        <TabsContent value="category" className="w-full">
          <ChartContainer
            config={{
              total: {
                label: 'Penjualan per Kategori',
                color: '#2563eb',
              },
            }}
            className="w-full h-[500px] rounded-xl border bg-white px-6 py-4 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Penjualan per Kategori</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Select for month, defaulting to "januari" */}
                <Select onValueChange={(value) => setSelectedMonth(value)} defaultValue={selectedMonth}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder={selectedMonth} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih Bulan</SelectLabel>
                      <SelectItem value="januari">Januari</SelectItem>
                      <SelectItem value="februari">Februari</SelectItem>
                      <SelectItem value="maret">Maret</SelectItem>
                      <SelectItem value="april">April</SelectItem>
                      <SelectItem value="mei">Mei</SelectItem>
                      <SelectItem value="juni">Juni</SelectItem>
                      <SelectItem value="juli">Juli</SelectItem>
                      <SelectItem value="agustus">Agustus</SelectItem>
                      <SelectItem value="september">September</SelectItem>
                      <SelectItem value="oktober">Oktober</SelectItem>
                      <SelectItem value="november">November</SelectItem>
                      <SelectItem value="desember">Desember</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {/* Select for year */}
                <Select onValueChange={(value) => setSelectedYear(value)} defaultValue={selectedYear}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder={selectedYear} />
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
                data={categoryData}
                layout="vertical"
                margin={{ top: 0, right: 0, left: isSmallScreen ? 0 : 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `Rp ${Number(value).toLocaleString('id-ID')}`}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  width={isSmallScreen ? 100 : 120}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="total" barSize={20} radius={[10, 10, 10, 10]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>

        {/* ---------- TAB #3: Laporan Penjualan per Produk ---------- */}
        <TabsContent value="product" className="w-full">
          <ChartContainer
            config={{
              total: {
                label: 'Penjualan Terlaris',
                color: '#2563eb',
              },
            }}
            className="w-full h-[500px] rounded-xl border bg-white px-6 py-4 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Penjualan Terlaris</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Month dropdown for products tab */}
                <Select onValueChange={(value) => setSelectedMonth(value)} defaultValue={selectedMonth}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder={selectedMonth} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih Bulan</SelectLabel>
                      <SelectItem value="januari">Januari</SelectItem>
                      <SelectItem value="februari">Februari</SelectItem>
                      <SelectItem value="maret">Maret</SelectItem>
                      <SelectItem value="april">April</SelectItem>
                      <SelectItem value="mei">Mei</SelectItem>
                      <SelectItem value="juni">Juni</SelectItem>
                      <SelectItem value="juli">Juli</SelectItem>
                      <SelectItem value="agustus">Agustus</SelectItem>
                      <SelectItem value="september">September</SelectItem>
                      <SelectItem value="oktober">Oktober</SelectItem>
                      <SelectItem value="november">November</SelectItem>
                      <SelectItem value="desember">Desember</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {/* Year dropdown */}
                <Select onValueChange={(value) => setSelectedYear(value)} defaultValue={selectedYear}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder={selectedYear} />
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
                  {`Rp ${item.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                </p>
              </div>
            ))}
          </ChartContainer>
        </TabsContent>

        {/* ---------- TAB #4: Laporan Stok ---------- */}
        <TabsContent value="stock" className="w-full">
          <ChartContainer
            config={{
              total: {
                label: 'Ringkasan Stok',
                color: '#2563eb',
              },
            }}
            className="w-full sm:h-[250px] h-[450px] rounded-xl border bg-white sm:px-6 py-4 shadow-sm p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Ringkasan Stok</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Month dropdown for stock tab */}
                <Select onValueChange={(value) => setSelectedMonth(value)} defaultValue={selectedMonth}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder={selectedMonth} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih Bulan</SelectLabel>
                      <SelectItem value="januari">Januari</SelectItem>
                      <SelectItem value="februari">Februari</SelectItem>
                      <SelectItem value="maret">Maret</SelectItem>
                      <SelectItem value="april">April</SelectItem>
                      <SelectItem value="mei">Mei</SelectItem>
                      <SelectItem value="juni">Juni</SelectItem>
                      <SelectItem value="juli">Juli</SelectItem>
                      <SelectItem value="agustus">Agustus</SelectItem>
                      <SelectItem value="september">September</SelectItem>
                      <SelectItem value="oktober">Oktober</SelectItem>
                      <SelectItem value="november">November</SelectItem>
                      <SelectItem value="desember">Desember</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {/* Year dropdown */}
                <Select onValueChange={(value) => setSelectedYear(value)} defaultValue={selectedYear}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder={selectedYear} />
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

            {/* Summary Cards */}
            <div className="sm:grid grid-cols-3 flex flex-col gap-4 mb-4">
              <div className="p-4 rounded bg-gray-50 border text-center">
                <p className="text-2xl font-bold">
                  {totalProducts.toLocaleString('en-US')}
                </p>
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

            {/* Stock Table */}
           
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
        </TabsContent>

        
      </Tabs>
    </div>
  );
}
