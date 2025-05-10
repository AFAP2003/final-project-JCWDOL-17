  'use client';

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
      handleDeleteUser,
      setDialogOpen,
      setIsEditMode,
      setEditingUserId,
      stores,
      handleRoleFilter,
      columns,
      previews,
      setPreviews,
      mainIndex,
      setMainIndex
    } = useUserManagement();

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
            stores={stores}
            setEditingUserId={setEditingUserId}
            setIsEditMode={setIsEditMode}
            previews={previews}
            setPreviews={setPreviews}
            mainIndex={mainIndex}
            setMainIndex={setMainIndex}
          />
        </div>

        {/* Filter row */}

        <UserManagementFilter
          globalFilter={globalFilter}
          handleSearchChange={handleSearchChange}
          handleVerificationFilter={handleVerificationFilter}
          table={table}
          handleRoleFilter={handleRoleFilter}
        />

        {/* Main table */}

        <UserManagementTable
          users={users}
          formik={formik}
          table={table}
          columns={columns}
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
