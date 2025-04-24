'use client'

import { User } from "@/lib/interfaces/userManagement.interface";
import { useState } from "react";
import { toast } from '@/hooks/use-toast';

export function userManagementAPI(){
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

      const fetchUsers = async () => {
        setIsLoading(true)
        try {
          const userRes = await fetch('http://localhost:8000/api/dashboard/users');
          const userData = await userRes.json();
    
          if (userRes.ok) {
            setUsers(userData.data);
            console.log('Users fetched successfully: ', userData);
          } else {
            console.error(
              'Failed to fetch users:',
              userData.message || 'Unknown Error',
            );
          }
        } catch (error) {
          console.log('Error fetching data: ', error);
        } finally{
          setIsLoading(false)
        }
      };

      const handleCreateUser = async (values) => {
        try {
          const userRes = await fetch('http://localhost:8000/api/dashboard/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: values.gambar,
              name: values.nama,
              email: values.email,
              password: values.password,
              role: values.role,
              storeId: values.toko,
              emailVerified: values.verifikasi,
            }),
          });
    
          const userData = await userRes.json();
    
          if (userRes.ok) {
            // If successful, refresh the user list
            fetchUsers();
            console.log('User Created Successfully: ', userData);
            toast({
             description:'User Created Successfully !'
            });
            return true
          } else {
            toast({
              variant: 'destructive',
              description: 'Failed to Create User.'
            })
            console.error(
              'Failed to create user:',
              userData.message || 'Unknown error',
            );
            return false
          }
        } catch (error) {
          toast({
            variant: 'destructive',
            description: 'Error creating user.'
          })
          console.error('Error creating user:', error);
          return false
        } 
      };
    
      const handleUpdateUser = async (id: string, values) => {
          try {
            const userRes = await fetch(
              `http://localhost:8000/api/dashboard/users/${id}`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  image: values.gambar,
                  name: values.nama,
                  email: values.email,
                  password: values.password,
                  role: values.role,
                  storeId: values.toko,
                  emailVerified: values.verifikasi,
                }),
              },
            );
      
            const userData = await userRes.json();
      
            if (userRes.ok) {
              fetchUsers();
              toast({
                description:'User Updated Successfully !'
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
              const userRes = await fetch(
                `http://localhost:8000/api/dashboard/users/${id}`,
                {
                  method: 'DELETE',
                },
              );
        
              const userData = await userRes.json();
        
              if (userRes.ok) {
                fetchUsers(); // Refresh table
                toast({
                    description:'User Deleted Successfully !'
                   });
                console.log('User deleted successfully:', userData);
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
      return { users, isLoading, fetchUsers,handleCreateUser,handleUpdateUser,handleDeleteUser }

}
 