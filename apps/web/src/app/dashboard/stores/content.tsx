'use client';

import type React from 'react';

import { useQuery } from '@tanstack/react-query';
import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import qs from 'query-string';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiclient } from '@/lib/apiclient';

// Import your API clien
// Types
export type GetAllStoreResponse = {
  stores: Store[];
  metadata: Metadata;
};

type Store = {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  maxDistance: number;
  isMain: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  adminId: string;
  admin: Admin;
};

type Admin = {
  id: string;
  role: 'ADMIN';
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  signupMethod: 'CREDENTIAL'[];
  createdAt: string;
  updatedAt: string;
  referralCode?: string;
  referredById?: string;
  storeId?: string;
};

type Metadata = {
  currentPage: number;
  pageSize: number;
  firstPage: number;
  lastPage: number;
  totalRecord: number;
};

export default function Content() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data
  const { data, isPending, isError } = useQuery({
    queryKey: ['all:store', 'management', currentQuery, currentPage],
    queryFn: async () => {
      const paramQuery = qs.stringify(
        { query: currentQuery, page: currentPage },
        {
          skipEmptyString: true,
          skipNull: true,
        },
      );
      const { data } = await apiclient.get<GetAllStoreResponse>(
        `/store?${paramQuery}`,
      );
      return data;
    },
  });

  // Handle search
  const handleSearch = () => {
    setCurrentQuery(searchQuery);
    setCurrentPage(1);
  };

  // Handle key press for search
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    if (!data?.metadata) return null;

    const { currentPage, lastPage } = data.metadata;
    const items = [];

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>,
    );

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    // Show current page and surrounding pages
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(lastPage - 1, currentPage + 1);
      i++
    ) {
      if (i <= 1 || i >= lastPage) continue;
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    // Show ellipsis if needed
    if (currentPage < lastPage - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    // Always show last page if there's more than one page
    if (lastPage > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            onClick={() => handlePageChange(lastPage)}
            isActive={currentPage === lastPage}
          >
            {lastPage}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return items;
  };

  // Handle actions
  const handleEdit = (storeId: string) => {
    console.log(`Edit store with ID: ${storeId}`);
    // Implement your edit logic here
  };

  const handleDelete = (storeId: string) => {
    console.log(`Delete store with ID: ${storeId}`);
    // Implement your delete logic here
  };

  const handleViewDetails = (storeId: string) => {
    console.log(`View details of store with ID: ${storeId}`);
    // Implement your view details logic here
  };

  return (
    <div className="space-y-4">
      <div>
        {/* <CardHeader className="pb-3">
          <CardTitle>Store Management</CardTitle>
        </CardHeader> */}
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* Search */}
            {/* <div className="flex w-full items-center space-x-2">
              <Input
                placeholder="Search stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                className="max-w-sm"
              />
              <Button onClick={handleSearch} type="button">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div> */}

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden md:table-cell">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Address
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">City</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Province
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending ? (
                    // Loading state
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`loading-${index}`}>
                        <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-20 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : isError ? (
                    // Error state
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-red-500"
                      >
                        Error loading stores. Please try again.
                      </TableCell>
                    </TableRow>
                  ) : data?.stores.length === 0 ? (
                    // Empty state
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No stores found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    // Data
                    data?.stores.map((store) => (
                      <TableRow key={store.id}>
                        <TableCell className="hidden md:table-cell font-medium">
                          {store.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{store.name}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {store.address}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {store.city}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {store.province}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              store.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {store.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(store.id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEdit(store.id)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(store.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {data?.metadata && data.metadata.lastPage > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      isActive={currentPage > 1}
                    />
                  </PaginationItem>

                  {renderPaginationItems()}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(
                          Math.min(data.metadata.lastPage, currentPage + 1),
                        )
                      }
                      isActive={currentPage < data.metadata.lastPage}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}

            {/* Summary */}
            <div className="text-sm text-muted-foreground">
              {data?.metadata && (
                <p>
                  Showing {data.stores.length} of {data.metadata.totalRecord}{' '}
                  stores
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  );
}
