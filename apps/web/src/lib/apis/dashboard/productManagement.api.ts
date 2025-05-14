'use client';

import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/constant';
import { Product } from '@/lib/interfaces/productManagement.interface';
import { useState } from 'react';

export default function productManagementAPI() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async (pageIndex: number, pageSize: number) => {
    setIsLoading(true);
    try {
      const page = pageIndex + 1;
      const productRes = await fetch(
        `${API_BASE_URL}/dashboard/products?page=${page}&take=${pageSize}`,
      );
      const productData = await productRes.json();

      if (productRes.ok) {
        setProducts(productData.data);
        console.log('Products fetched successfully: ', productData);
        return productData;
      } else {
        console.error(
          'Failed to fetch products:',
          productData.message || 'Unknown Error',
        );
      }
    } catch (error) {
      console.log('Error fetching data: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async (values) => {
    try {
      const formData = new FormData();

      Array.from(values.image).forEach((file) => {
        formData.append('image', file);
      });

      formData.append('name', values.nama || '');
      formData.append('description', values.deskripsi || '');
      formData.append('price', String(values.harga || 0));
      formData.append('weight', String(values.berat || 0));
      formData.append('sku', values.sku || '');
      formData.append('categoryId', values.kategoriId || '');
      formData.append('isActive', String(values.isActive || true));

      const productRes = await fetch(`${API_BASE_URL}/dashboard/products`, {
        method: 'POST',

        body: formData,
      });

      const productData = await productRes.json();

      if (productRes.ok) {
        console.log('product Created Successfully: ', productData);
        toast({
          description: 'Product Created Successfully !',
        });
        return true;
      } else if (productRes.status === 400) {
        toast({
          variant: 'destructive',
          description: 'Product already exist.',
        });
        console.error(
          'Failed to create Product: Duplicate Product Error',
          productData,
        );
        return false;
      } else {
        toast({
          variant: 'destructive',
          description: 'Failed to Create Product.',
        });
        console.error(
          'Failed to Create Product:',
          productData.message || 'Unknown error',
        );
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error creating product.',
      });
      console.error('Error creating product:', error);
      return false;
    }
  };

  const handleUpdateProduct = async (id: string, values) => {
    try {
      const formData = new FormData();

      // Append new image files
      Array.from(values.image).forEach((file) => {
        formData.append('image', file);
      });

      // Append the fields
      formData.append('name', values.nama || '');
      formData.append('description', values.deskripsi || '');
      formData.append('price', String(values.harga || 0));
      formData.append('weight', String(values.berat || 0));
      formData.append('sku', values.sku || '');
      formData.append('categoryId', values.kategoriId || '');
      formData.append('isActive', String(values.isActive));

      // Pass main image index
      formData.append('mainIndex', String(values.mainIndex || 0));

      // Append keptImages (only if editing)
      if (values.keptImages && Array.isArray(values.keptImages)) {
        values.keptImages.forEach((url) => {
          formData.append('keptImages', url);
        });
      }
      const productRes = await fetch(
        `${API_BASE_URL}/dashboard/products/${id}`,
        {
          method: 'PUT',
          body: formData,
        },
      );

      const productData = await productRes.json();

      if (productRes.ok) {
        toast({
          description: 'Product Updated Successfully !',
        });
        console.log('Product Updated Successfully: ', productData);
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Failed to Create Product.',
        });
        console.error(
          'Failed to Update Product:',
          productData.message || 'Unknown error',
        );
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error Updating Product.',
      });
      console.error('Error Updating Product:', error);
      return false;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const productRes = await fetch(
        `${API_BASE_URL}/dashboard/products/${id}`,
        {
          method: 'DELETE',
        },
      );

      const productData = await productRes.json();

      if (productRes.ok) {
        toast({
          description: 'Product Deleted Successfully !',
        });
        console.log('Product deleted successfully:', productData);
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Failed to Delete product.',
        });
        console.error(
          'Failed to delete product:',
          productData.message || 'Unknown error',
        );
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error deleting product.',
      });
      console.error('Error deleting product:', error);
      return false;
    }
  };
  return {
    products,
    isLoading,
    fetchProducts,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
  };
}
