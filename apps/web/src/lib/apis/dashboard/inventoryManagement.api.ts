'use client';

import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/constant';
import { Inventory } from '@/lib/interfaces/inventoryManagement.interface';
import { useState } from 'react';

export function inventoryManagementAPI() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInventories = async (pageIndex: number, pageSize: number) => {
    setIsLoading(true);
    try {
      const page = pageIndex + 1;

      const inventoryRes = await fetch(
        `${API_BASE_URL}/dashboard/inventories?page=${page}&take=${pageSize}`,
      );
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

  const handleCreateInventory = async (values) => {
    try {
      let quantity;
      if (values.tambah) {
        quantity = Number(values.tambah);
      } else if (values.kurangi) {
        // For creation, it might not make sense to reduce from zero,
        // but we'll include it for consistency
        quantity = Math.max(0, values.sekarang - Number(values.kurangi));
      } else {
        quantity = 0; // Default if neither has a value
      }
      const inventoryRes = await fetch(
        `${API_BASE_URL}/dashboard/inventories`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
          description: 'inventory Created Successfully !',
        });
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Failed to Create inventory.',
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
        description: 'Error creating inventory.',
      });
      console.error('Error creating inventory:', error);
      return false;
    }
  };

  const handleUpdateInventory = async (id: string, values) => {
    try {
      const updateData = {
        minStock: Number(values.minimal),
        // These fields control the stock adjustment
        addQuantity: values.mode === 'tambah' ? Number(values.tambah || 0) : 0,
        subtractQuantity: values.mode === 'kurangi' ? Number(values.kurangi || 0) : 0
      };
      const inventoryRes = await fetch(
        `${API_BASE_URL}/dashboard/inventories/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        },
      );

      const inventoryData = await inventoryRes.json();

      if (inventoryRes.ok) {
        toast({
          description: 'inventory Updated Successfully !',
        });
        console.log('inventory Updated Successfully: ', inventoryData);
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Failed to Create inventory.',
        });
        console.error(
          'Failed to update inventory:',
          inventoryData.message || 'Unknown error',
        );
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error updating inventory.',
      });
      console.error('Error updating inventory:', error);
      return false;
    }
  };

  const handleDeleteInventory = async (id: string) => {
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
          description: 'inventory Deleted Successfully !',
        });
        console.log('inventory deleted successfully:', inventoryData);
        return true
      } else {
        toast({
          variant: 'destructive',
          description: 'Failed to Delete inventory.',
        });
        console.error(
          'Failed to delete inventory:',
          inventoryData.message || 'Unknown error',
        );
        return false
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error deleting inventory.',
      });
      console.error('Error deleting inventory:', error);
      return false
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