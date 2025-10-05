import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/interfaces/userManagement.interface';
import { flexRender, Table } from '@tanstack/react-table';

interface UserManagementFilterProps {
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVerificationFilter: (value: string) => void;
  table: Table<User>;
  handleRoleFilter: (value: string) => void;
  searchTerm: string;
  selectedUserRole: 'all' | 'SUPER' | 'ADMIN' | 'USER'; 
  selectedVerification: 'all' | 'true' | 'false';
  clearAllFilters: () => void;
}

export default function UserManagementFilter({
  handleSearchChange,
  handleVerificationFilter,
  table,
  handleRoleFilter,
  searchTerm,
  selectedUserRole,
  selectedVerification,
  clearAllFilters,
}: UserManagementFilterProps) {
  // Check if any filters are active

  return (
    <div className="mb-4 flex flex-row items-end justify-between gap-2 sm:gap-0">
        <div className="flex  flex-col-reverse gap-4 w-full sm:w-auto lg:flex lg:flex-row lg:gap-4">
        <div className="relative w-full sm:w-auto">
          <Input
            placeholder="Cari..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="order-2 h-9 w-full sm:w-[200px] text-sm sm:order-1 pr-8"
          />
          {searchTerm && (
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() =>
                handleSearchChange({
                  target: { value: '' },
                } as React.ChangeEvent<HTMLInputElement>)
              }
            >
              <X size={16} />
            </button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-xs"
        >
          Atur Ulang Filter
        </Button>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
        <Select onValueChange={handleRoleFilter} value={selectedUserRole}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Pilih Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Pilih Role</SelectLabel>
              <SelectItem value="all">Semua Role</SelectItem>
              <SelectItem value="SUPER">Super Admin</SelectItem>
              <SelectItem value="ADMIN">Store Admin</SelectItem>
              <SelectItem value="USER">User</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          onValueChange={handleVerificationFilter}
          value={selectedVerification}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Pilih Verifikasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Pilih Verifikasi</SelectLabel>
              <SelectItem value="all">Semua Verifikasi</SelectItem>
              <SelectItem value="true">Terverifikasi</SelectItem>
              <SelectItem value="false">Belum Terverifikasi</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <DropdownMenu modal={true}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Eye className="mr-2 h-4 w-4" /> Lihat Kolom
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Kolom</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {typeof column.columnDef.header === 'string'
                    ? column.columnDef.header
                    : flexRender(column.columnDef.header, column.getContext())}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
    </div>
  );
}
