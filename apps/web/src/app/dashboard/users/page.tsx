'use client';

import { useUserManagement } from '@/hooks/useUserManagement';
import UserManagementFilter from './_components/userManagementFilter';
import UserManagementForm from './_components/userManagementForm';
import UserManagementPagination from './_components/userManagementPagination';
import OverlaySpinner from '@/components/overlay/loadingOverlay';
import UserManagementskeleton from './_components/userManagementSkeleton';
import { useSession } from '@/lib/auth/client';
import UserManagementTable from './_components/userManagementTable';

export default function UserManagement() {
  const {
    users,
    isLoading,
    dialogOpen,
    isEditMode,
    formik,
    table,
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
    setMainIndex,
    isDetailMode,
    setIsDetailMode,
    searchTerm,
    clearAllFilters,
    selectedUserRole,
    selectedVerification,
    isProcessing,
  } = useUserManagement();
  const { data: session } = useSession();

  if (isLoading) {
    return <UserManagementskeleton />;
  }
  const user = session?.user as any;
  return (
    <>
      {isProcessing && <OverlaySpinner />}
      {user.role === 'SUPER' && (
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
              setMainIndex={setMainIndex}
              isDetailMode={isDetailMode}
              setIsDetailMode={setIsDetailMode}
            />
          </div>

          <UserManagementFilter
            searchTerm={searchTerm}
            selectedUserRole={selectedUserRole}
            selectedVerification={selectedVerification}
            handleSearchChange={handleSearchChange}
            handleRoleFilter={handleRoleFilter}
            handleVerificationFilter={handleVerificationFilter}
            table={table}
            clearAllFilters={clearAllFilters}
          />

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
                image: user.image ?? '',
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

          <UserManagementPagination table={table} />
        </div>
      )}
    </>
  );
}
