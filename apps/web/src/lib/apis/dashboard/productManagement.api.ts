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
      const productRes = await fetch(`${API_BASE_URL}/dashboard/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.nama,
          description: values.deskripsi,
          price: values.harga || '10000',
          weight: parseFloat(values.berat) || '1',
          isActive: values.isActive || true,
          sku: values.sku,
          categoryId: values.kategoriId,
        }),
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
      const productRes = await fetch(
        `${API_BASE_URL}/dashboard/products/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: values.nama,
            description: values.deskripsi,
            price: Number(values.harga) || 10000,
            weight: Number(values.berat) || 1,
            isActive: values.isActive || true,
            sku: values.sku || 'agraega',
            categoryId: values.kategoriId || '2',
          }),
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
        return true
      } else {
        toast({
          variant: 'destructive',
          description: 'Failed to Delete product.',
        });
        console.error(
          'Failed to delete product:',
          productData.message || 'Unknown error',
        );
        return false
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error deleting product.',
      });
      console.error('Error deleting product:', error);
      return false
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
