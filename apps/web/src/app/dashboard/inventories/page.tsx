'use client';

import UseInventoryManagement from '@/hooks/useInventoryManagement';
import InventoryManagementForm from './_components/inventoryManagementForm';
import InventoryManagementFilter from './_components/inventoryManagementFilter';
import InventoryManagementTable from './_components/inventoryManagementTable';
import InventoryManagementPagination from './_components/inventoryManagementPagination';
import InventoryManagementskeleton from './_components/inventoryManagementSkeleton';

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
    handleStoreFilter
  } = UseInventoryManagement();

  // useEffect(() => {
  //   fetchInventories();
  //   fetchStores()
  //   fetchCategories()
  //   fetchProducts()
  // }, []);

  if(isLoading){
    return <InventoryManagementskeleton/>
  }
  return (
    <div className="min-h-screen w-full flex flex-col gap-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="sm:text-4xl text-2xl font-bold">Manajemen Invetaris</h1>
        {/* Dialog */}
        <InventoryManagementForm
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          formik={formik}
          isEditMode={isEditMode}
          products={products}
          stores={stores}
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
      />
      {/* Main table */}
      <InventoryManagementTable table={table} columns={columns}/>

      {/* Pagination */}
      <InventoryManagementPagination table={table} />
    </div>
  );
}
