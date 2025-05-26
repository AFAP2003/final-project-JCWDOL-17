'use client';

import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/constant';
import { Discount } from '@/lib/interfaces/discountManagement.interface';
import { toISO } from '@/lib/utils';
import { useState } from 'react';

export function discountManagementAPI() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDiscounts = async (
    pageIndex: number,
    pageSize: number,
    search: string = '',
    type: string = '',
    valueType: string = '',
    status: string = '',
  ) => {
    setIsLoading(true);
    try {
      const page = pageIndex + 1;
      let url = `${API_BASE_URL}/dashboard/discounts?page=${page}&take=${pageSize}`;

      if (search) url += `&search=${encodeURIComponent(search)}`;

      // Map frontend type values to backend values
      if (type && type !== 'all') {
        let backendType = '';
        switch (type) {
          case 'Diskon Normal':
            backendType = 'NO_RULES_DISCOUNT';
            break;
          case 'Diskon Syarat':
            backendType = 'WITH_MAX_PRICE';
            break;
          case 'Beli 1 Gratis 1':
            backendType = 'BUY_X_GET_Y';
            break;
          default:
            backendType = type;
        }
        url += `&type=${encodeURIComponent(backendType)}`;
      }

      if (valueType && valueType !== 'all') {
        url += `&valueType=${encodeURIComponent(valueType)}`;
      }

      if (status && status !== 'all') {
        url += `&status=${encodeURIComponent(status)}`;
      }

      console.log('Fetching discounts with URL:', url); // Debug log

      const discountRes = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const discountData = await discountRes.json();

      if (discountRes.ok) {
        setDiscounts(discountData.data);
        console.log('Discounts fetched successfully: ', discountData);
        return discountData;
      } else {
        console.error(
          'Failed to fetch Discounts:',
          discountData.message || 'Unknown Error',
        );
      }
    } catch (error) {
      console.log('Error fetching data: ', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCreateDiscount = async (values, setIsProcessing) => {
    setIsProcessing(true);
    try {
      const discountRes = await fetch(`${API_BASE_URL}/dashboard/discounts`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.nama,
          description: values.deskripsi,
          storeId: values.toko === 'all' ? null : values.toko,
          type:
            values.tipe_diskon === 'diskon_normal'
              ? 'NO_RULES_DISCOUNT'
              : values.tipe_diskon === 'diskon_syarat'
                ? 'WITH_MAX_PRICE'
                : values.tipe_diskon === 'bogo'
                  ? 'BUY_X_GET_Y'
                  : '',
          isPercentage: values.tipe_nilai_diskon === 'percentage',
          value: Number(values.nilai_diskon),
          minPurchase: values.min_pembelian ? Number(values.min_pembelian) : 0,
          maxDiscount: values.potongan_maks ? Number(values.potongan_maks) : 0,
          startDate: toISO(values.tanggal_mulai),
          endDate: toISO(values.kadaluwarsa) || null,
        }),
      });

      const discountData = await discountRes.json();

      if (discountRes.ok) {
        console.log('Discount Created Successfully: ', discountData);
        toast({
          description: 'Diskon Berhasil Dibuat !',
        });
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Gagal Membuat Diskon.',
        });
        console.error(
          'Failed to create Discount:',
          discountData.message || 'Unknown error',
        );
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error Membuat Diskon.',
      });
      console.error('Error creating inventory:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateDiscount = async (id: string, values, setIsProcessing) => {
    setIsProcessing(true);

    try {
      const discountRes = await fetch(
        `${API_BASE_URL}/dashboard/discounts/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: values.nama,
            description: values.deskripsi,
            storeId: values.toko === 'all' ? null : values.toko,
            type:
              values.tipe_diskon === 'diskon_normal'
                ? 'NO_RULES_DISCOUNT'
                : values.tipe_diskon === 'diskon_syarat'
                  ? 'WITH_MAX_PRICE'
                  : values.tipe_diskon === 'bogo'
                    ? 'BUY_X_GET_Y'
                    : '',
            isPercentage: values.tipe_nilai_diskon === 'percentage',
            value: Number(values.nilai_diskon),
            minPurchase: values.min_pembelian
              ? Number(values.min_pembelian)
              : 0,
            maxDiscount: values.potongan_maks
              ? Number(values.potongan_maks)
              : 0,
            startDate: toISO(values.tanggal_mulai),
            endDate: toISO(values.kadaluwarsa || null),
          }),
        },
      );

      const discountData = await discountRes.json();

      if (discountRes.ok) {
        toast({
          description: 'Diskon Berhasil Diperbarui !',
        });
        console.log('Discount Updated Successfully: ', discountData);
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Gagal Memperbarui Diskon.',
        });
        console.error(
          'Failed to update Discount:',
          discountData.message || 'Unknown error',
        );
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error Memperbarui Diskon.',
      });
      console.error('Error updating Discount:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteDiscount = async (id: string, setIsProcessing) => {
    setIsProcessing(true);
    try {
      const discountRes = await fetch(
        `${API_BASE_URL}/dashboard/discounts/${id}`,
        {
          method: 'DELETE',
        },
      );

      const discountData = await discountRes.json();

      if (discountRes.ok) {
        toast({
          description: 'Diskon Berhasil Dihapus !',
        });
        console.log('Discount deleted successfully:', discountData);
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Gagal Menghapus Diskon.',
        });
        console.error(
          'Failed to delete Discount:',
          discountData.message || 'Unknown error',
        );
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error Menghapus Diskon.',
      });
      console.error('Error deleting inventory:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  return {
    discounts,
    isLoading,
    fetchDiscounts,
    handleCreateDiscount,
    handleUpdateDiscount,
    handleDeleteDiscount,
  };
}
