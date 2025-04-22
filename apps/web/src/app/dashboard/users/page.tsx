'use client';

import {  useEffect } from 'react';
import UserManagementskeleton from './_components/userManagementSkeleton';
import UserManagementTable from './_components/userManagementTable';
import UserManagementFilter from './_components/userManagementFilter';
import UserManagementForm from './_components/userManagementForm';
import UserManagementPagination from './_components/userManagementPagination';
import { useUserManagement } from '@/hooks/useUserManagement';

export default function UserManagement() {
  const {
    users,
    isLoading,
    dialogOpen,
    isEditMode,
    formik,
    table, 
    globalFilter,
    handleSearchChange,
    handleVerificationFilter,
    fetchUsers,
    handleDeleteUser,
    setDialogOpen,
    setIsEditMode,
    setEditingUserId,
  } = useUserManagement();
  useEffect(() => {
    fetchUsers();
  }, []);

  if (isLoading) {
    return <UserManagementskeleton />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col gap-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="sm:text-4xl text-2xl font-bold">Manajemen User</h1>
        <UserManagementForm
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          formik={formik}
          isEditMode={isEditMode}
        />
      </div>

      {/* Filter row */}

      <UserManagementFilter
        globalFilter={globalFilter}
        handleSearchChange={handleSearchChange}
        handleVerificationFilter={handleVerificationFilter}
        table={table}
      />

      {/* Main table */}

      <UserManagementTable
        users={users}
        formik={formik}
        table={table}
        onDelete={handleDeleteUser}
        onStartEdit={(user) => {
          setIsEditMode(true);
          setEditingUserId(user.id);
          setDialogOpen(true);
          formik.setValues({
            gambar: user.image ?? '',
            nama: user.name ?? '',
            email: user.email ?? '',
            password: '',
            alamat: '',
            toko: user.storeId ?? '',
            kode_rujukan: user.referralCode ?? '',
            role: user.role ?? '',
            verifikasi: !!user.emailVerified,
          });
        }}
      />

      {/* Pagination */}

      <UserManagementPagination table={table} />
    </div>
  );
}
