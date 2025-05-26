'use client';

import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/constant';
import { Category } from '@/lib/interfaces/categoryManagement.interface';
import { useState } from 'react';

export function categoryManagementAPI() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async (
    pageIndex: number,
    pageSize: number,
    search = '',
  ) => {
    setIsLoading(true);
    try {
      const page = pageIndex + 1;

      let url = `${API_BASE_URL}/dashboard/categories?page=${page}&take=${pageSize}`;

      if (search) url += `&search=${encodeURIComponent(search)}`;

      const categoryRes = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const categoryData = await categoryRes.json();

      if (categoryRes.ok) {
        setCategories(categoryData.data);
        console.log('Categories fetched successfully: ', categoryData);
        return categoryData;
      } else {
        console.error(
          'Failed to fetch Categories:',
          categoryData.message || 'Unknown Error',
        );
      }
    } catch (error) {
      console.log('Error fetching data: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async (values, setIsProcessing) => {
    setIsProcessing(true);
    try {
      const categoryRes = await fetch(`${API_BASE_URL}/dashboard/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.nama,
          description: values.deskripsi,
          image: values.gambar,
          isActive: values.isActive,
        }),
      });

      const categoryData = await categoryRes.json();

      if (categoryRes.ok) {
        console.log('Category Created Successfully: ', categoryData);
        toast({
          description: 'Kategori Berhasil Dibuat !',
        });
        return true;
      } else if (categoryRes.status === 400) {
        toast({
          variant: 'destructive',
          description: 'Nama Sudah Terdaftar. Gunakan Nama Lain !',
        });
        console.error(
          'Failed to create Category: Duplicate Name',
          categoryData,
        );
        return false;
      } else {
        toast({
          variant: 'destructive',
          description: 'Gagal Membuat Kategori.',
        });
        console.error(
          'Failed to create Category:',
          categoryData.message || 'Unknown error',
        );
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error Membuat Kategori.',
      });
      console.error('Error creating Category:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateCategory = async (id: string, values, setIsProcessing) => {
    setIsProcessing(true);
    try {
      const categoryRes = await fetch(
        `${API_BASE_URL}/dashboard/categories/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: values.nama,
            description: values.deskripsi,
            image: values.gambar,
            isActive: values.isActive,
          }),
        },
      );

      const categoryData = await categoryRes.json();

      if (categoryRes.ok) {
        toast({
          description: 'Kategori Berhasil Diperbarui !',
        });
        console.log('Category Updated Successfully: ', categoryData);
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Gagal Memperbarui Kategori.',
        });
        console.error(
          'Failed to update Category:',
          categoryData.message || 'Unknown error',
        );
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error Memperbarui Kategori.',
      });
      console.error('Error updating category:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCategory = async (id: string, setIsProcessing) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/categories/${id}`, {
        method: 'DELETE',
      });
      const body = await res.json();

      if (res.status === 409) {
        // our "products still exist" case
        toast({
          variant: 'destructive',
          description:
            'Gagal Menghapus Kategori: Ada Produk yang bergantung terhadap kategori ini. Hapus semua produk yang berkaitan dengan kategori ini untuk melanjutkan.',
        });
        return false;
      }

      if (!res.ok) {
        toast({
          variant: 'destructive',
          description: 'Gagal Menghapus Kategori.',
        });
        return false;
      }

      toast({ description: 'Kategori Berhasil Dihapus!' });
      return true;
    } catch (err) {
      toast({
        variant: 'destructive',
        description: 'Error Menghapus Kategori.',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  return {
    categories,
    isLoading,
    fetchCategories,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  };
}
