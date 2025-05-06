import { API_BASE_URL } from '@/lib/constant';
import { useState } from 'react';

export default function reportManagementAPI(){
    const [isLoading,setIsLoading] = useState(true)
    const [monthlySales,setMonthlySales] = useState([])
    const [categorySales,setCategorySales] = useState([])
    const [productSales,setProductSales] = useState([])
    const [stockReport,setStockReport] = useState([])
    const fetchMonthlySales = async (year:string)=>{
        try {
            setIsLoading(true)
            const reportRes = await fetch(`${API_BASE_URL}/dashboard/monthly-sales?year=${year}`)
            const reportData = await reportRes.json()

            if (reportRes.ok){
                setMonthlySales(reportData.data)
                console.log('Monthly Sales for All Products Fetched Successfully: ', reportData);

            }
            else{
                console.error('Failed to fetch Monthly Sales', reportData.message || 'Unknown Error')
            }
        } catch (error) {
            console.log('Error fetching data: ', error);

        } finally{
            setIsLoading(false)
        }
    }

    const fetchCategorySales = async (year:string,month:string)=>{
        try {
            setIsLoading(true)
            const reportRes = await fetch(`${API_BASE_URL}/dashboard/category-sales?year=${year}&month=${month}`)
            const reportData = await reportRes.json()

            if (reportRes.ok){
                setCategorySales(reportData.data)
                console.log('Monthly Sales for All Category Fetched Successfully: ', reportData);
            }
            else{
                console.error('Failed to fetch Category Sales', reportData.message || 'Unknown Error')

            }
        } catch (error) {
            console.log('Error fetching data: ', error);

        } finally{
            setIsLoading(false)
        }
    }

    const fetchProductSales = async (year:string,month:string)=>{
        try {
            setIsLoading(true)

            const reportRes = await fetch(`${API_BASE_URL}/dashboard/product-sales?year=${year}&month=${month}`)
            const reportData = await reportRes.json()

            if(reportRes.ok){
                setProductSales(reportData.data)
                console.log('Monthly Sales for Each Products Fetched Successfully: ', reportData);
            }
            else{
                console.error('Failed to fetch Product Sales', reportData.message || 'Unknown Error')
            }
        } catch (error) {
            console.log('Error fetching data: ',error)
        } finally{
            setIsLoading(false)
        }

      
    }

    const fetchStockReport = async (year:string,month:string,storeId='all')=>{
        try {
            setIsLoading(true)

            const reportRes = await fetch(`${API_BASE_URL}/dashboard/stock-report?year=${year}&month=${month}&storeId=${storeId}`)
            const reportData = await reportRes.json()

            if(reportRes.ok){
                setStockReport(reportData.data)
                console.log('Stock Reports Summary Fetched Successfully: ', reportData);
            } else{
                console.error('Failed to fetch Stock Report', reportData.message || 'Unknown Error')

            }
        } catch (error) {
            console.log('Error fetching data: ',error)

        } finally{
            setIsLoading(false)
        }
    }

    return{fetchMonthlySales,isLoading,monthlySales,fetchCategorySales,categorySales,productSales,fetchProductSales,fetchStockReport,stockReport}
}