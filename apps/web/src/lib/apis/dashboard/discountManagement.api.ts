'use client';

import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/constant';
import { Discount } from '@/lib/interfaces/discountManagement.interface';
import { toISO } from '@/lib/utils';
import { useState } from 'react';

export function discountManagementAPI() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDiscounts = async (pageIndex: number, pageSize: number) => {
    setIsLoading(true);
    try {
      const page = pageIndex + 1;
      const discountRes = await fetch(
        `${API_BASE_URL}/dashboard/discounts?page=${page}&take=${pageSize}`,{
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
         
      );
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

  const handleCreateDiscount = async (values) => {
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
          description: 'Discount Created Successfully !',
        });
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Failed to Create Discount.',
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
        description: 'Error creating Discount.',
      });
      console.error('Error creating inventory:', error);
      return false;
    }
  };

  const handleUpdateDiscount = async (id: string, values) => {
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
          description: 'Discount Updated Successfully !',
        });
        console.log('Discount Updated Successfully: ', discountData);
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Failed to Create Discount.',
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
        description: 'Error updating Discount.',
      });
      console.error('Error updating Discount:', error);
      return false;
    }
  };

  const handleDeleteDiscount = async (id: string) => {
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
          description: 'Discount Deleted Successfully !',
        });
        console.log('Discount deleted successfully:', discountData);
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Failed to Delete Discount.',
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
        description: 'Error deleting Discount.',
      });
      console.error('Error deleting inventory:', error);
      return false;
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
