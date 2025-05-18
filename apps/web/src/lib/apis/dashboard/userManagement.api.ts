'use client';

import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/constant';
import { User } from '@/lib/interfaces/userManagement.interface';
import { useState } from 'react';

export function userManagementAPI() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchUsers = async (pageIndex: number, pageSize: number) => {
    setIsLoading(true);
    try {
      const page = pageIndex + 1;
      const userRes = await fetch(
        `${API_BASE_URL}/dashboard/users?page=${page}&take=${pageSize}`,
      );
      const userData = await userRes.json();

      if (userRes.ok) {
        setUsers(userData.data);
        console.log('Users fetched successfully: ', userData);
        return userData;
      } else {
        console.error(
          'Failed to fetch users:',
          userData.message || 'Unknown Error',
        );
      }
    } catch (error) {
      console.log('Error fetching data: ', error);
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

  const handleCreateUser = async (values) => {
    try {
      const formData = new FormData();
      formData.append('image', values.image[0]); // the File object
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
          description: 'User Created Successfully !',
        });
        return true;
      } else if (userRes.status === 400) {
        toast({
          variant: 'destructive',
          description: 'Email already exist.',
        });
        console.error('Failed to create user: Duplicate Email', userData);
        return false;
      } else {
        toast({
          variant: 'destructive',
          description: 'Failed to Create User.',
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
        description: 'Error creating user.',
      });
      console.error('Error creating user:', error);
      return false;
    }
  };

  const handleUpdateUser = async (id: string, values) => {
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
          description: 'User Updated Successfully !',
        });
        console.log('User Updated Successfully: ', userData);
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Failed to Create User.',
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
        description: 'Error updating user.',
      });
      console.error('Error updating user:', error);
      return false;
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const userRes = await fetch(`${API_BASE_URL}/dashboard/users/${id}`, {
        method: 'DELETE',
      });

      const userData = await userRes.json();

      if (userRes.ok) {
        toast({
          description: 'User Deleted Successfully !',
        });
        console.log('User deleted successfully:', userData);
        return true;
      } else {
        toast({
          variant: 'destructive',
          description: 'Failed to Delete User.',
        });
        console.error(
          'Failed to delete user:',
          userData.message || 'Unknown error',
        );
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Error deleting user.',
      });
      console.error('Error deleting user:', error);
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
