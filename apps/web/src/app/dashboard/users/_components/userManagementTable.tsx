'use client';

import React from 'react';
import { flexRender, Table as ReactTable } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { User } from '@/lib/interfaces/userManagement.interface'; // your User type
import { MyFormValues } from '@/validations/user.validation';
import { FormikProps } from 'formik';

interface UserManagementTableProps {
  users: User[];
  formik: FormikProps<MyFormValues>;
  onDelete: (id: string) => void;
  onStartEdit: (user: User) => void;
  table: ReactTable<any>;
  columns: any[];
}

export default function UserManagementTable({
  table,
  columns,
}: UserManagementTableProps) {
  return (
    <>
      {/* Table */}
      <div className="overflow-x-auto border rounded">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    className="cursor-pointer"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[h.column.getIsSorted() as string] ?? null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  No data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
