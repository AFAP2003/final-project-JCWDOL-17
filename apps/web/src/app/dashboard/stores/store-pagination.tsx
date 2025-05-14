'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { motion } from 'framer-motion';

interface StoresPaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

export default function StoresPagination({
  currentPage,
  lastPage,
  onPageChange,
}: StoresPaginationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex justify-center"
    >
      <Pagination className="mx-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={`transition-all duration-300 ${
                currentPage <= 1
                  ? 'pointer-events-none opacity-50'
                  : 'cursor-pointer hover:text-emerald-600 hover:border-emerald-300'
              }`}
            />
          </PaginationItem>

          {Array.from({ length: lastPage }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === lastPage ||
                (page >= currentPage - 1 && page <= currentPage + 1),
            )
            .map((page, index, array) => {
              // Add ellipsis if there are gaps in the sequence
              if (index > 0 && page - array[index - 1] > 1) {
                return (
                  <PaginationItem key={`ellipsis-${page}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={page === currentPage}
                    onClick={() => onPageChange(page)}
                    className={
                      page === currentPage
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'hover:text-emerald-600 hover:border-emerald-300'
                    }
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
              className={`transition-all duration-300 ${
                currentPage >= lastPage
                  ? 'pointer-events-none opacity-50'
                  : 'cursor-pointer hover:text-emerald-600 hover:border-emerald-300'
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </motion.div>
  );
}
