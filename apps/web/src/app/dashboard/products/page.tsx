'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import UseProductManagement from '@/hooks/useProductManagement';
import ProductManagementFilter from './_components/productManagementFilter';
import ProductManagementForm from './_components/productManagementForm';
import ProductManagementPagination from './_components/productManagementPagination';
import ProductManagementskeleton from './_components/productManagementSkeleton';
import ProductManagementTable from './_components/productManagementTable';
import { Plus } from 'lucide-react';
export default function Products() {
  const {
    formik,
    columns,
    isLoading,
    table,
    handleSearchChange,
    globalFilter,
    dialogOpen,
    isEditMode,
    setDialogOpen,
    handleStatusFilter,
    categories,
    handleCategoryFilter,
    setIsEditMode,
    setEditingProductId,
    previews,
    setPreviews,
    mainIndex,
    setMainIndex,
    isDetailMode,
    setIsDetailMode,
    isSessionLoading,
    user,
  } = UseProductManagement();
  // Check if session exists after loading

  if (isLoading) {
    return <ProductManagementskeleton />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col gap-6 p-4">
      <div className="flex justify-end">
        
      </div>

      {/* header + create dialog */}
      <div className="flex justify-between items-center">
        <h1 className="sm:text-4xl text-2xl font-bold">Produk</h1>
        <div className='flex gap-10'>
                  <Link href="/dashboard/categories">
          <Button className="w-[150px]">          
            <Plus className="w-4 h-4 mr-1" />
           Kategori</Button>
        </Link>
        <ProductManagementForm
          categories={categories}
          formik={formik}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          setEditingProductId={setEditingProductId}
          previews={previews}
          setPreviews={setPreviews}
          mainIndex={mainIndex}
          setMainIndex={setMainIndex}
          isDetailMode={isDetailMode}
          setIsDetailMode={setIsDetailMode}
        />
        </div>
      </div>

      {/* filter row */}

      <ProductManagementFilter
        globalFilter={globalFilter}
        handleStatusFilter={handleStatusFilter}
        handleSearchChange={handleSearchChange}
        table={table}
        categories={categories}
        handleCategoryFilter={handleCategoryFilter}
      />
      {/* table */}
      <ProductManagementTable
        table={table}
        columns={columns}
        onStartEdit={(user) => {
          setIsEditMode(true);
          setEditingProductId(user.id);
          setDialogOpen(true);
        }}
      />

      {/* pagination */}
      <ProductManagementPagination table={table} />
    </div>
  );
}
