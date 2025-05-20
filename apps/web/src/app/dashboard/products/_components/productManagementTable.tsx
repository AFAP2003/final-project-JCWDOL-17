import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { flexRender, Table as ReactTable } from '@tanstack/react-table';

interface ProductManagementTableProps {
  table: ReactTable<any>;
  columns: any[];
  onStartEdit: (user: User) => void;
}
export default function ProductManagementTable({
  table,
  columns,
  onStartEdit,
}: ProductManagementTableProps) {
  return (
    <div className="rounded-md border border-gray-200 overflow-x-auto w-full">
      <Table className="min-w-full">
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead
                  key={h.id}
                  onClick={
                    h.column.getCanSort()
                      ? h.column.getToggleSortingHandler()
                      : undefined
                  }
                  className="cursor-pointer select-none whitespace-nowrap"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                  {{ asc: ' 🔼', desc: ' 🔽' }[
                    h.column.getIsSorted() as string
                  ] ?? null}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((r) => (
              <TableRow key={r.id}>
                {r.getVisibleCells().map((c) => (
                  <TableCell key={c.id}>
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
