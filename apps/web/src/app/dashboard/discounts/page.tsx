'use client';

import { flexRender } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Eye } from 'lucide-react';
import UseDiscountManagement from '@/hooks/useDiscountManagement';
import DiscountManagementPagination from './_components/discountManagementPagination';
import DiscountManagementTable from './_components/discountManagementTable';
import DiscountManagementForm from './_components/discountManagementForm';
import DiscountManagementFilter from './_components/discountManagementFilter';
import DiscountManagementskeleton from './_components/discountManagementSkeleton';



export default function DiscountManagement() {
  const {
    handleSearchChange,
    handleStatusFilter,
    table,
    globalFilter,
    columns,
    formik,
    isLoading,
    stores,
    isEditMode,
    dialogOpen,
    setDialogOpen,
    handleTypeFilter,
    handleTypeValueFilter,
    setIsEditMode,
    setEditingDiscountId
    
  } = UseDiscountManagement();
 

  if(isLoading){
    return <DiscountManagementskeleton/>
  }
  return (
    <div className="min-h-screen w-full flex flex-col gap-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="sm:text-4xl text-2xl font-bold">Manajemen Diskon</h1>

        {/* Dialog */}
        <DiscountManagementForm 
        formik={formik}  
        stores={stores}
        isEditMode={isEditMode}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        setIsEditMode={setIsEditMode}
        setEditingDiscountId={setEditingDiscountId}
        />
      </div>

      {/* Column toggles (desktop) */}
      <DropdownMenu modal={false}>
        <div className="hidden lg:hidden md:flex justify-end">
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Eye /> Lihat
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Kolom</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(v) => col.toggleVisibility(!!v)}
                >
                  {typeof col.columnDef.header === 'string'
                    ? col.columnDef.header
                    : flexRender(col.columnDef.header, col.getContext())}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </div>
      </DropdownMenu>

      {/* Filters row */}
      <DiscountManagementFilter
        globalFilter={globalFilter}
        handleSearchChange={handleSearchChange}
        handleStatusFilter={handleStatusFilter}
        table={table}
        handleTypeFilter={handleTypeFilter}
        handleTypeValueFilter={handleTypeValueFilter}
      />

      {/* Table */}
      <DiscountManagementTable table={table} columns={columns} />

      {/* Pagination */}
      <DiscountManagementPagination table={table}  />
    </div>
  );
}
