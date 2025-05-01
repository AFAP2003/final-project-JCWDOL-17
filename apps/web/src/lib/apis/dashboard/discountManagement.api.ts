'use client'

import { useState } from "react";
import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from "@/lib/constant";
import { Discount } from "@/lib/interfaces/discountManagement.interface";

export function discountManagementAPI(){
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [isLoading, setIsLoading] = useState(true);

      const fetchDiscounts = async () => {
        setIsLoading(true)  
        try {
          const discountRes = await fetch(`${API_BASE_URL}/dashboard/discounts`);
          const discountData = await discountRes.json();
    
          if (discountRes.ok) {
            setDiscounts(discountData.data);
            console.log('Discounts fetched successfully: ', discountData);
          } else {
            console.error(
              'Failed to fetch Discounts:',
              discountData.message || 'Unknown Error',
            );
          }
        } catch (error) {
          console.log('Error fetching data: ', error);
        } finally{
          setIsLoading(false)
        }
      };

      const handleCreateDiscount = async (values) => {
        try {
          const discountRes = await fetch(`${API_BASE_URL}/dashboard/discounts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: values.nama,
              description:values.deskripsi,
              image:values.gambar,
              isActive:values.isActive
            }),
          });
    
          const discountData = await discountRes.json();
    
          if (discountRes.ok) {
            fetchDiscounts();
            console.log('Discount Created Successfully: ', discountData);
            toast({
             description:'Discount Created Successfully !'
            });
            return true
          } else {
            toast({
              variant: 'destructive',
              description: 'Failed to Create Discount.'
            })
            console.error(
              'Failed to create inventory:',
              discountData.message || 'Unknown error',
            );
            return false
          }
        } catch (error) {
          toast({
            variant: 'destructive',
            description: 'Error creating Discount.'
          })
          console.error('Error creating inventory:', error);
          return false
        } 
      };
    
      const handleUpdateDiscount = async (id: string, values) => {
          try {
            const discountRes = await fetch(
              `${API_BASE_URL}/dashboard/discounts/${id}`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: values.nama,
                    description:values.deskripsi,
                    image:values.gambar,
                    isActive:values.isActive
                }),
              },
            );
      
            const discountData = await discountRes.json();
      
            if (discountRes.ok) {
              fetchDiscounts();
              toast({
                description:'Discount Updated Successfully !'
               });
              console.log('Discount Updated Successfully: ', discountData);
              return true;
            } else {
              toast({
                variant: 'destructive',
                description: 'Failed to Create Discount.',
              });
              console.error(
                'Failed to update inventory:',
                discountData.message || 'Unknown error',
              );
              return false;
            }
          } catch (error) {
            toast({
              variant: 'destructive',
              description: 'Error updating Discount.',
            });
            console.error('Error updating Discount:', error);
            return false;
          }
        };

        const handleDeleteDiscount = async (id: string) => {
            try {
              const discountRes = await fetch(
                `${API_BASE_URL}/dashboard/discounts/${id}`,
                {
                  method: 'DELETE',
                },
              );
        
              const discountData = await discountRes.json();
            
              if (discountRes.ok) {
                fetchDiscounts(); 
                toast({
                    description:'Discount Deleted Successfully !'
                   });
                console.log('Discount deleted successfully:', discountData);
              } else {
                toast({
                  variant: 'destructive',
                  description: 'Failed to Delete Discount.',
                });
                console.error(
                  'Failed to delete Discount:',
                  discountData.message || 'Unknown error',
                );
              }
            } catch (error) {
              toast({
                variant: 'destructive',
                description: 'Error deleting Discount.',
              });
              console.error('Error deleting inventory:', error);
            }
          };
      return { discounts, isLoading, fetchDiscounts,handleCreateDiscount,handleUpdateDiscount,handleDeleteDiscount }

}
 