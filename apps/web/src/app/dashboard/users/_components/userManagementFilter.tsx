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
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/interfaces/userManagement.interface';
import { flexRender, Table } from '@tanstack/react-table';

interface UserManagementFilterProps {
  globalFilter: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVerificationFilter: (value: string) => void;
  table: Table<User>;
  handleRoleFilter: (value: string) => void;
}

export default function UserManagementFilter({
  globalFilter,
  handleSearchChange,
  handleVerificationFilter,
  table,
  handleRoleFilter,
}: UserManagementFilterProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-2 sm:gap-0">
      <div className="flex gap-2">
        <Input
          placeholder="Cari..."
          value={globalFilter}
          onChange={handleSearchChange}
          className="order-2 h-9 w-[140px] text-sm sm:w-[200px] sm:order-1"
        />
      </div>
      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4">
        <Select onValueChange={handleRoleFilter} defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Pilih Verifikasi" />
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
        <Select onValueChange={handleVerificationFilter} defaultValue="all">
          <SelectTrigger className="w-[150px]">
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
              <Eye /> Lihat
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
