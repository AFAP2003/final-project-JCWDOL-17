'use client';

import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/constant';
import { Product } from '@/lib/interfaces/productManagement.interface';
import { useState } from 'react';

export default function productManagementAPI() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async (
    pageIndex: number,
    pageSize: number,
    search: string,
    category: string = '',
    status: string = '',
  ) => {
    setIsLoading(true);
    try {
      const page = pageIndex + 1;
      let url = `${API_BASE_URL}/dashboard/products?page=${page}&take=${pageSize}`;

      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (category && category !== 'all')
        url += `&categoryId=${encodeURIComponent(category)}`;
      if (status && status !== 'all')
        url += `&status=${encodeURIComponent(status)}`;

      // Include credentials for session/cookie authentication
      const productRes = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

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

  const handleCreateProduct = async (values, setIsProcessing) => {
    setIsProcessing(true);
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
          description: 'Produk Berhasil Dibuat !',
        });
        return true;
      } else if (productRes.status === 400) {
        toast({
          variant: 'destructive',
          description: 'Product Sudah Terdaftar. Gunakan Nama Produk Lain !',
        });
        console.error(
          'Failed to create Product: Duplicate Product Error',
          productData,
        );
        return false;
      } else {
        toast({
          variant: 'destructive',
          description: 'Gagal Membuat Produk.',
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
        description: 'Error Membuat Produk.',
      });
      console.error('Error creating product:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateProduct = async (id: string, values, setIsProcessing) => {
    setIsProcessing(true);
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
      formData.append('isActive', String(values.isActive));

      formData.append('mainIndex', String(values.mainIndex || 0));

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
          description: 'Produk Berhasil Diperbarui !',
        });
        console.log('Product Updated Successfully: ', productData);
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Gagal Memperbarui Produk.',
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
        description: 'Error Memperbarui Produk.',
      });
      console.error('Error Updating Product:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── lib/apis/dashboard/productManagement.api.ts ───
  const handleDeleteProduct = async (id: string, setIsProcessing) => {
    setIsProcessing(true);
    try {
      const productRes = await fetch(
        `${API_BASE_URL}/dashboard/products/${id}`,
        { method: 'DELETE' },
      );
      const productData = await productRes.json();

      if (productRes.status === 409) {
        // dependency error
        toast({
          variant: 'destructive',
          description:
            'Gagal Menghapus Produk: Ada Inventaris yang bergantung terhadap produk ini. Hapus semua inventaris yang berkaitan dengan produk ini untuk melanjutkan.',
          // Cannot delete product: there are inventory records tied to it. Remove inventory entries first.
        });
        return false;
      }

      if (!productRes.ok) {
        // generic failure
        toast({
          variant: 'destructive',
          description: 'Gagal Menghapus Produk.',
        });
        return false;
      }

      // success
      toast({ description: 'Produk Berhasil Dihapus !' });
      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error Menghapus Produk.',
      });
      return false;
    } finally {
      setIsProcessing(false);
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
