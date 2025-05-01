import { Store } from "@/lib/interfaces/storeManagement.interface";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/constant";

export default function storeManagementAPI(){
   const [stores,setStores] = useState<Store[]>([])
   const [isLoading,setIsLoading] = useState(true)

   const fetchStores = async () => {
           setIsLoading(true)  
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
           } finally{
             setIsLoading(false)
           }
         };

         return{isLoading,fetchStores,stores}
}