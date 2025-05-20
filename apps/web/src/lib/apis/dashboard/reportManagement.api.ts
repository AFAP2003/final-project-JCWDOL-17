import { API_BASE_URL } from '@/lib/constant';
import { useState } from 'react';

export default function reportManagementAPI() {
  const [isLoading, setIsLoading] = useState(true);
  const [monthlySales, setMonthlySales] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [productSales, setProductSales] = useState([]);
  const [stockReport, setStockReport] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const fetchMonthlySales = async (year: string, storeId: string) => {
    try {
      setIsLoading(true);
      const reportRes = await fetch(
        `${API_BASE_URL}/dashboard/monthly-sales?year=${year}&storeId=${storeId}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const reportData = await reportRes.json();

      if (reportRes.ok) {
        setMonthlySales(reportData.data);
        console.log(
          'Monthly Sales for All Products Fetched Successfully: ',
          reportData,
        );
      } else {
        console.error(
          'Failed to fetch Monthly Sales',
          reportData.message || 'Unknown Error',
        );
      }
    } catch (error) {
      console.log('Error fetching data: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategorySales = async (
    year: string,
    month: string,
    storeId: string,
  ) => {
    try {
      setIsLoading(true);
      const reportRes = await fetch(
        `${API_BASE_URL}/dashboard/category-sales?year=${year}&month=${month}&storeId=${storeId}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const reportData = await reportRes.json();

      if (reportRes.ok) {
        setCategorySales(reportData.data);
        console.log(
          'Monthly Sales for All Category Fetched Successfully: ',
          reportData,
        );
      } else {
        console.error(
          'Failed to fetch Category Sales',
          reportData.message || 'Unknown Error',
        );
      }
    } catch (error) {
      console.log('Error fetching data: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductSales = async (
    year: string,
    month: string,
    storeId: string,
  ) => {
    try {
      setIsLoading(true);

      const reportRes = await fetch(
        `${API_BASE_URL}/dashboard/product-sales?year=${year}&month=${month}&storeId=${storeId}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const reportData = await reportRes.json();

      if (reportRes.ok) {
        setProductSales(reportData.data);
        console.log(
          'Monthly Sales for Each Products Fetched Successfully: ',
          reportData,
        );
      } else {
        console.error(
          'Failed to fetch Product Sales',
          reportData.message || 'Unknown Error',
        );
      }
    } catch (error) {
      console.log('Error fetching data: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStockReport = async (
    pageIndex: number,
    pageSize: number,
    year: string,
    month: string,
    storeId = 'all',
  ) => {
    try {
      setIsLoading(true);

      const reportRes = await fetch(
        `${API_BASE_URL}/dashboard/stock-report?page=${pageIndex}&take=${pageSize}&year=${year}&month=${month}&storeId=${storeId}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const reportData = await reportRes.json();

      if (reportRes.ok) {
        setStockReport(reportData.data);
        setPagination({
          pageIndex: reportData.pagination.currentPage,
          pageSize: reportData.pagination.pageSize,
          totalItems: reportData.pagination.totalItems,
          totalPages: reportData.pagination.totalPages,
        });
        console.log('Stock Reports Summary Fetched Successfully: ', reportData);
      } else {
        console.error(
          'Failed to fetch Stock Report',
          reportData.message || 'Unknown Error',
        );
      }
    } catch (error) {
      console.log('Error fetching data: ', error);
    } finally {
      setIsLoading(false);
    }
  };
  return {
    isLoading,
    pagination,
    setPagination,
    fetchMonthlySales,
    monthlySales,
    fetchCategorySales,
    categorySales,
    productSales,
    fetchProductSales,
    fetchStockReport,
    stockReport,
  };
}
