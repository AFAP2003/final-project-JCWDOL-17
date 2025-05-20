import { API_BASE_URL } from '@/lib/constant';
import { Store } from '@/lib/interfaces/storeManagement.interface';
import { useState } from 'react';

export default function storeManagementAPI() {
  const [stores, setStores] = useState<Store[]>([]);
  const [storeByAdmin, setStoreByAdmin] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const storeRes = await fetch(`${API_BASE_URL}/dashboard/stores`);
      const storeData = await storeRes.json();

      if (storeRes.ok) {
        setStores(storeData.data);
        console.log('Stores fetched successfully: ', storeData);
      } else {
        console.error(
          'Failed to fetch Stores:',
          storeData.message || 'Unknown Error',
        );
      }
    } catch (error) {
      console.log('Error fetching data: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStoreByAdminId = async (adminId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/stores/by-admin/`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (res.ok) {
        setStoreByAdmin(data.data);
        return data.data as Store;
      } else {
        console.error(
          'Failed to fetch store by admin:',
          data.message || 'Unknown error',
        );
        return null;
      }
    } catch (error) {
      console.error('Error fetching store by admin:', error);
      return null;
    }
  };

  return { isLoading, fetchStores, stores, fetchStoreByAdminId, storeByAdmin };
}
