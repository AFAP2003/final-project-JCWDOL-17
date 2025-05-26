'use client';

import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/constant';
import { Inventory } from '@/lib/interfaces/inventoryManagement.interface';
import { useState } from 'react';

export function inventoryManagementAPI() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInventories = async (
    pageIndex: number,
    pageSize: number,
    search = '',
    store = '',
    category = '',
    status = '',
  ) => {
    setIsLoading(true);
    try {
      const page = pageIndex + 1;

      let url = `${API_BASE_URL}/dashboard/inventories?page=${page}&take=${pageSize}`;

      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (store && store !== 'all')
        url += `&storeId=${encodeURIComponent(store)}`;
      if (category && category !== 'all')
        url += `&categoryId=${encodeURIComponent(category)}`;
      if (status && status !== 'all')
        url += `&status=${encodeURIComponent(status)}`;

      console.log('API URL:', url); // Debug log

      const inventoryRes = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const inventoryData = await inventoryRes.json();

      if (inventoryRes.ok) {
        setInventories(inventoryData.data);
        console.log('Inventories fetched successfully: ', inventoryData);
        return inventoryData;
      } else {
        console.error(
          'Failed to fetch Inventories:',
          inventoryData.message || 'Unknown Error',
        );
      }
    } catch (error) {
      console.log('Error fetching data: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInventory = async (values, setIsProcessing) => {
    setIsProcessing(true);
    try {
      let quantity;
      if (values.tambah) {
        quantity = Number(values.tambah);
      } else if (values.kurangi) {
        quantity = Math.max(0, values.sekarang - Number(values.kurangi));
      } else {
        quantity = 0;
      }
      const inventoryRes = await fetch(
        `${API_BASE_URL}/dashboard/inventories`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            productId: values.produk,
            storeId: values.toko,
            quantity: quantity,
            minStock: Number(values.minimal),
          }),
        },
      );

      const inventoryData = await inventoryRes.json();

      if (inventoryRes.ok) {
        console.log('inventory Created Successfully: ', inventoryData);
        toast({
          description: 'Inventaris Berhasil Dibuat !',
        });
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Inventaris Gagal Dibuat.',
        });
        console.error(
          'Failed to create inventory:',
          inventoryData.message || 'Unknown error',
        );
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error Membuat Inventaris.',
      });
      console.error('Error creating inventory:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateInventory = async (id, values, setIsProcessing) => {
    setIsProcessing(true);
    try {
      console.log('Starting inventory update for ID:', id);
      console.log('Update values:', values);

      // Simplify and standardize the update payload
      const updateData = {
        minStock: Number(values.minStock || values.minimal || 0),
        addQuantity: Number(
          values.addQuantity ||
            (values.mode === 'tambah' ? values.tambah : 0) ||
            0,
        ),
        subtractQuantity: Number(
          values.subtractQuantity ||
            (values.mode === 'kurangi' ? values.kurangi : 0) ||
            0,
        ),
      };

      console.log('Sending update payload:', updateData);

      const inventoryRes = await fetch(
        `${API_BASE_URL}/dashboard/inventories/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(updateData),
        },
      );

      const responseText = await inventoryRes.text();
      let inventoryData;

      try {
        inventoryData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error('Invalid response from server');
      }

      console.log('Update API response:', inventoryData);

      if (inventoryRes.ok) {
        toast({
          description: 'Inventaris Berhasil Diperbarui!',
        });
        return true;
      } else {
        const errorMessage = inventoryData.message || 'Unknown error';
        toast({
          variant: 'destructive',
          description: `Gagal Memperbarui Inventaris: ${errorMessage}`,
        });
        console.error('Failed to update inventory:', errorMessage);
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: `Error Memperbarui Inventaris: ${error.message || String(error)}`,
      });
      console.error('Error updating inventory:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteInventory = async (id: string, setIsProcessing) => {
    setIsProcessing(true);
    try {
      const inventoryRes = await fetch(
        `${API_BASE_URL}/dashboard/inventories/${id}`,
        {
          method: 'DELETE',
        },
      );

      const inventoryData = await inventoryRes.json();

      if (inventoryRes.ok) {
        toast({
          description: 'inventaris Berhasil Dihapus!',
        });
        console.log('inventory deleted successfully:', inventoryData);
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Gagal Menghapus Inventaris.',
        });
        console.error(
          'Failed to delete inventory:',
          inventoryData.message || 'Unknown error',
        );
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error Menghapus Inventaris.',
      });
      console.error('Error deleting inventory:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  return {
    inventories,
    isLoading,
    fetchInventories,
    handleCreateInventory,
    handleUpdateInventory,
    handleDeleteInventory,
  };
}
