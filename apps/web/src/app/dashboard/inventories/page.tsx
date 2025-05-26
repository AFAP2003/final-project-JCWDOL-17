'use client';

import UseInventoryManagement from '@/hooks/useInventoryManagement';
import InventoryManagementFilter from './_components/inventoryManagementFilter';
import InventoryManagementForm from './_components/inventoryManagementForm';
import InventoryManagementPagination from './_components/inventoryManagementPagination';
import InventoryManagementskeleton from './_components/inventoryManagementSkeleton';
import InventoryManagementTable from './_components/inventoryManagementTable';
import OverlaySpinner from '@/components/overlay/loadingOverlay';

export default function Inventory() {
  const {
    table,
    handleSearchChange,
    handleStatusFilter,
    isLoading,
    globalFilter,
    isEditMode,
    dialogOpen,
    setDialogOpen,
    columns,
    formik,
    stores,
    categories,
    products,
    handleCategoryFilter,
    handleStoreFilter,
    setIsEditMode,
    setEditingInventoryId,
    isDetailMode,
    setIsDetailMode,
    searchTerm,
    clearAllFilters,
    selectedCategory,
    selectedStatus,
    selectedStore,
    isProcessing,
  } = UseInventoryManagement();

  if (isLoading) {
    return <InventoryManagementskeleton />;
  }
  return (
    <>
      {isProcessing && <OverlaySpinner />}
      <div className="min-h-screen w-full flex flex-col gap-6 p-4">
        <div className="flex justify-between items-center">
          <h1 className="sm:text-4xl text-2xl font-bold">
            Manajemen Inventaris
          </h1>
          {/* Dialog */}
          <InventoryManagementForm
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            formik={formik}
            isEditMode={isEditMode}
            products={products}
            stores={stores}
            setIsEditMode={setIsEditMode}
            setEditingInventoryId={setEditingInventoryId}
            isDetailMode={isDetailMode}
            setIsDetailMode={setIsDetailMode}
          />
        </div>

        {/* Filter row */}
        <InventoryManagementFilter
          globalFilter={globalFilter}
          handleSearchChange={handleSearchChange}
          handleStatusFilter={handleStatusFilter}
          table={table}
          stores={stores}
          categories={categories}
          handleCategoryFilter={handleCategoryFilter}
          handleStoreFilter={handleStoreFilter}
          searchTerm={searchTerm}
          clearAllFilters={clearAllFilters}
          selectedCategory={selectedCategory}
          selectedStatus={selectedStatus}
          selectedStore={selectedStore}
        />
        {/* Main table */}
        <InventoryManagementTable
          table={table}
          columns={columns}
          onStartEdit={(inv) => {
            setIsEditMode(true);
            setEditingInventoryId(inv.id);
            setDialogOpen(true);
          }}
        />

        {/* Pagination */}
        <InventoryManagementPagination table={table} />
      </div>
    </>
  );
}
