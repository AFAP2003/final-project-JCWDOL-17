'use client';

import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/constant';
import { Category } from '@/lib/interfaces/categoryManagement.interface';
import { useState } from 'react';

export function categoryManagementAPI() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async (pageIndex: number, pageSize: number) => {
    setIsLoading(true);
    try {
      const page = pageIndex + 1;
      const categoryRes = await fetch(
        `${API_BASE_URL}/dashboard/categories?page=${page}&take=${pageSize}`,
      );
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

  const handleCreateCategory = async (values) => {
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
          description: 'Category Created Successfully !',
        });
        return true;
      } else if (categoryRes.status === 400) {
        toast({
          variant: 'destructive',
          description: 'Name already exist.',
        });
        console.error(
          'Failed to create Category: Duplicate Name',
          categoryData,
        );
        return false;
      } else {
        toast({
          variant: 'destructive',
          description: 'Failed to Create Category.',
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
        description: 'Error creating Category.',
      });
      console.error('Error creating Category:', error);
      return false;
    }
  };

  const handleUpdateCategory = async (id: string, values) => {
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
          description: 'Category Updated Successfully !',
        });
        console.log('Category Updated Successfully: ', categoryData);
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Failed to Create Category.',
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
        description: 'Error updating category.',
      });
      console.error('Error updating category:', error);
      return false;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const categoryRes = await fetch(
        `${API_BASE_URL}/dashboard/categories/${id}`,
        {
          method: 'DELETE',
        },
      );

      const categoryData = await categoryRes.json();

      if (categoryRes.ok) {
        toast({
          description: 'category Deleted Successfully !',
        });
        console.log('category deleted successfully:', categoryData);
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Failed to Delete category.',
        });
        console.error(
          'Failed to delete category:',
          categoryData.message || 'Unknown error',
        );
      }
      return false;
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error deleting category.',
      });
      console.error('Error deleting category:', error);
      return false;
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
