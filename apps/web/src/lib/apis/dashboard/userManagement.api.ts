'use client';

import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/constant';
import { User } from '@/lib/interfaces/userManagement.interface';
import { useState } from 'react';

export function userManagementAPI() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchUsers = async (
    pageIndex: number,
    pageSize: number,
    searchTerm: string = '',
    role: string,
    verified: string,
  ) => {
    setIsLoading(true);
    try {
      const page = pageIndex + 1;
      let url = `${API_BASE_URL}/dashboard/users?page=${page}&take=${pageSize}`;
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      if (role !== 'all') {
        url += `&role=${role}`;
      }
      if (verified !== 'all') {
        url += `&verified=${verified}`;
      }

      const res = await fetch(url);
      const json = await res.json();

      if (res.ok) {
        setUsers(json.data);
        return json;
      } else {
        console.error('Failed to fetch users:', json.message);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchUserById = async (id: string) => {
    setIsLoading(true);
    try {
      const userByIdRes = await fetch(`${API_BASE_URL}/dashboard/users/${id}`);
      const userData = await userByIdRes.json();

      if (userByIdRes.ok) {
        return userData;
      } else {
        console.error(
          'Failed to fetch user by id:',
          userData.message || 'Unknown Error',
        );
      }
    } catch (error) {
      console.log('Error fetching data: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (values, setIsProcessing) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      if (values.image && values.image.length > 0) {
        formData.append('image', values.image[0]);
      }
      formData.append('name', values.nama);
      formData.append('email', values.email);
      formData.append('password', values.password);
      formData.append('role', values.role);
      formData.append('storeId', values.toko);
      formData.append('emailVerified', String(values.verifikasi));
      const userRes = await fetch(`${API_BASE_URL}/dashboard/users`, {
        method: 'POST',
        body: formData,
      });

      const userData = await userRes.json();

      if (userRes.ok) {
        console.log('User Created Successfully: ', userData);
        toast({
          description: 'User Berhasil Dibuat !',
        });
        return true;
      } else if (userRes.status === 400) {
        toast({
          variant: 'destructive',
          description: 'Email Sudah Terdaftar. Gunakan Email lain !',
        });
        console.error('Failed to create user: Duplicate Email', userData);
        return false;
      } else {
        toast({
          variant: 'destructive',
          description: 'Gagal Membuat User.',
        });
        console.error(
          'Failed to create user:',
          userData.message || 'Unknown error',
        );
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error Membuat User.',
      });
      console.error('Error creating user:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateUser = async (id: string, values, setIsProcessing) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      if (values.image && values.image[0]) {
        formData.append('image', values.image[0]);
      }
      formData.append('name', values.nama);
      formData.append('email', values.email);
      formData.append('role', values.role);
      formData.append('storeId', values.toko);
      formData.append('emailVerified', String(values.verifikasi));
      if (values.password) {
        formData.append('password', values.password);
      }
      const userRes = await fetch(`${API_BASE_URL}/dashboard/users/${id}`, {
        method: 'PUT',
        body: formData,
      });

      const userData = await userRes.json();

      if (userRes.ok) {
        toast({
          description: 'User Berhasil Diperbarui !',
        });
        console.log('User Updated Successfully: ', userData);
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'User Gagal Diberbarui.',
        });
        console.error(
          'Failed to update user:',
          userData.message || 'Unknown error',
        );
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error Memperbarui User.',
      });
      console.error('Error updating user:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (id: string, setIsProcessing) => {
    setIsProcessing(true);
    try {
      const userRes = await fetch(`${API_BASE_URL}/dashboard/users/${id}`, {
        method: 'DELETE',
      });

      const userData = await userRes.json();

      if (userRes.ok) {
        toast({
          description: 'User Berhasil Dihapus !',
        });
        console.log('User deleted successfully:', userData);
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Gagal Menghapus User.',
        });
        console.error(
          'Failed to delete user:',
          userData.message || 'Unknown error',
        );
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error Menghapus User.',
      });
      console.error('Error deleting user:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  return {
    users,
    isLoading,
    fetchUsers,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    fetchUserById,
  };
}
