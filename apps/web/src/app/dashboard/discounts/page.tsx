'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UseDiscountManagement from '@/hooks/useDiscountManagement';
import { flexRender } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import DiscountManagementFilter from './_components/discountManagementFilter';
import DiscountManagementForm from './_components/discountManagementForm';
import DiscountManagementPagination from './_components/discountManagementPagination';
import DiscountManagementskeleton from './_components/discountManagementSkeleton';
import DiscountManagementTable from './_components/discountManagementTable';
import OverlaySpinner from '@/components/overlay/loadingOverlay';

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
    setEditingDiscountId,
    isDetailMode,
    setIsDetailMode,
    clearAllFilters,
    selectedType,
    selectedValueType,
    selectedStatus,
    searchTerm,
    isProcessing,
  } = UseDiscountManagement();

  if (isLoading) {
    return <DiscountManagementskeleton />;
  }

  return (
    <>
      {isProcessing && <OverlaySpinner />}
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
            isDetailMode={isDetailMode}
            setIsDetailMode={setIsDetailMode}
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
          handleSearchChange={handleSearchChange}
          handleStatusFilter={handleStatusFilter}
          table={table}
          handleTypeFilter={handleTypeFilter}
          handleTypeValueFilter={handleTypeValueFilter}
          clearAllFilters={clearAllFilters}
          selectedStatus={selectedStatus}
          selectedType={selectedType}
          selectedValueType={selectedValueType}
          searchTerm={searchTerm}
        />

        {/* Table */}
        <DiscountManagementTable table={table} columns={columns} />

        {/* Pagination */}
        <DiscountManagementPagination table={table} />
      </div>
    </>
  );
}
