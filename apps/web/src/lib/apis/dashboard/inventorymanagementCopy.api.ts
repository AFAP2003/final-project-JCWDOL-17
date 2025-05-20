'use client';

import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/constant';
import { Inventory } from '@/lib/interfaces/inventoryManagement.interface';
import { useState } from 'react';

export function inventoryManagementAPI() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination]         = useState({ currentPage: 1, pageSize: 10, totalPages: 1 });

  const fetchInventories = async (pageIndex: number, pageSize: number) => {
    setIsLoading(true);
    try {
      const page = pageIndex + 1;

      const inventoryRes = await fetch(
        `${API_BASE_URL}/dashboard/inventories?page=${page}&take=${pageSize}`,
        {                   
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        },
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
          credentials:'include',
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

  // In your inventoryManagementAPI.ts

const handleUpdateInventory = async (id, values) => {
 try {
   console.log(">>> API: handleUpdateInventory START for ID:", id);
   console.log(">>> API: Received values:", values);

   const updateData = {
     minStock: Number(values.minStock || values.minimal || 0),
     // Ensure these are numbers, using 0 for empty strings from optional fields
     addQuantity: Number(values.addQuantity || (values.mode === 'tambah' ? values.tambah : 0) || 0),
     subtractQuantity: Number(values.subtractQuantity || (values.mode === 'kurangi' ? values.kurangi : 0) || 0),
   };

   console.log(">>> API: Sending update payload:", updateData); // <-- Log payload

   const inventoryRes = await fetch(
     `${API_BASE_URL}/dashboard/inventories/${id}`,
     {
       method: 'PUT',
       headers: { 'Content-Type': 'application/json' },
       credentials: 'include',
       body: JSON.stringify(updateData),
     },
   );

   console.log(">>> API: Received response status:", inventoryRes.status); // <-- Log status
   // Try to read response text even if not OK, might contain error details
   const responseText = await inventoryRes.text();
   console.log(">>> API: Received response text:", responseText);

   let inventoryData = null;
   try {
     // Attempt to parse JSON only if there's text and it looks like JSON
     if (responseText && responseText.trim().startsWith('{')) {
        inventoryData = JSON.parse(responseText);
        console.log(">>> API: Parsed response JSON:", inventoryData);
     } else {
         console.log(">>> API: Response text is not JSON or empty.");
     }
   } catch (e) {
     console.warn(">>> API: Could not parse response as JSON:", e);
   }


   if (inventoryRes.ok) {
     console.log(">>> API: Response OK (status 2xx). Returning true.");
     // The toast is shown here
     toast({ description: 'Inventory Updated Successfully!' });
     return true; // Indicate success back to onSubmit
   } else {
     console.error(">>> API: Response NOT OK (status not 2xx). Returning false.");
     const errorMessage = inventoryData?.message || responseText || `Status: ${inventoryRes.status}`;
     toast({
       variant: 'destructive',
       description: `Failed to update inventory: ${errorMessage}`,
     });
     return false; // Indicate failure back to onSubmit
   }
 } catch (error) {
   console.error('>>> API: ERROR caught in handleUpdateInventory:', error); // <-- Log errors caught by catch
   toast({
     variant: 'destructive',
     description: `Error updating inventory: ${error.message || String(error)}`,
   });
   return false; // Indicate failure
 } finally {
     console.log(">>> API: handleUpdateInventory END"); // <-- Log end regardless of success/fail
 }
}

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
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Failed to Delete inventory.',
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
        description: 'Error deleting inventory.',
      });
      console.error('Error deleting inventory:', error);
      return false;
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
