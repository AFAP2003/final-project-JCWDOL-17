'use client';

import Link from 'next/link';
import CategoryManagementPagination from './_components/categoryManagementPagination';
import { ChevronLeft } from 'lucide-react';
import CategoryManagementskeleton from './_components/categoryManagementSkeleton';
import { useCategoryManagement } from '@/hooks/useCategoryManagement';
import CategoryManagementFilter from './_components/categoryManagementFilter';
import CategoryManagementTable from './_components/categoryManagementTable';
import CategoryManagementForm from './_components/categoryManagementForm';
import OverlaySpinner from '@/components/overlay/loadingOverlay';

export default function Category() {
  const {
    isLoading,
    formik,
    columns,
    table,
    globalFilter,
    handleSearchChange,
    dialogOpen,
    setDialogOpen,
    isEditMode,
    isDetailMode,
    setIsEditMode,
    setIsDetailMode,
    setEditingCategoryId,
    clearAllFilters,
    searchTerm,
    isProcessing,
  } = useCategoryManagement();

  if (isLoading) {
    return <CategoryManagementskeleton />;
  }

  return (
    <>
      {isProcessing && <OverlaySpinner />}
      <div className="min-h-screen w-full flex flex-col gap-6 p-4">
        <Link href="/dashboard/products">
          <div className="flex gap-2 text-gray-400">
            <ChevronLeft className="w-6 h-6" /> Kembali
          </div>
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="sm:text-4xl text-2xl font-bold">Kategori</h1>
          <CategoryManagementForm
            formik={formik}
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            isEditMode={isEditMode}
            isDetailMode={isDetailMode}
            setIsDetailMode={setIsDetailMode}
            setIsEditMode={setIsEditMode}
            setEditingCategoryId={setEditingCategoryId}
          />
        </div>
        <CategoryManagementFilter
          searchTerm={searchTerm}
          clearAllFilters={clearAllFilters}
          globalFilter={globalFilter}
          handleSearchChange={handleSearchChange}
          table={table}
        />
        <CategoryManagementTable table={table} columns={columns} />
        <CategoryManagementPagination table={table} />
      </div>
    </>
  );
}
