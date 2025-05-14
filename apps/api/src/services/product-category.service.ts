import { ProductCategoryGetAllDTO } from '@/dtos/product-category-get-all.dto';
import { calculateMetadataPagination } from '@/helpers/pagination';
import { prismaclient } from '@/prisma';
import { Category, Prisma } from '@prisma/client';
import { z } from 'zod';

export class ProductCategoryService {
  getAll = async (dto: z.infer<typeof ProductCategoryGetAllDTO>) => {
    const searchterm = (() => {
      if (!dto.query) return Prisma.empty;

      const token = dto.query
        .trim()
        .split(/\s+/)
        .map((term) => `${term}:*`)
        .join(' & ');

      const query = Prisma.sql`(to_tsvector('simple', pc."name") @@ to_tsquery('simple', ${token}))`;
      return Prisma.sql`AND ${query}`;
    })();

    const orderBy = (() => {
      switch (dto.orderBy) {
        case 'createdAt':
          return Prisma.sql`pc."createdAt" ASC`;
        case '-createdAt':
          return Prisma.sql`pc."createdAt" DESC`;
        case 'count':
          return Prisma.sql`"productCount" ASC`;
        case '-count':
          return Prisma.sql`"productCount" DESC`;
        default:
          return Prisma.sql`pc."createdAt" DESC`;
      }
    })();

    const query = Prisma.sql`
        SELECT 
          (COUNT(*) OVER())::int as "resultCount",
          pc."id", pc."name", pc."description", pc."image",
          pc."isActive", pc."createdAt", pc."updatedAt",
          
          COUNT(p."id")::int as "productCount"

        FROM "Category" as pc
        LEFT JOIN "Product" as p ON p."categoryId" = pc."id" AND p."isActive" = ${true}
        WHERE
          pc."isActive" = ${true}
          ${searchterm}
        GROUP BY pc."id"
        ORDER BY ${orderBy}
        OFFSET ${(dto.page - 1) * dto.pageSize}
        LIMIT ${dto.pageSize}`;

    const categories: (Category & {
      resultCount: number;
      productCount: number;
    })[] = await prismaclient.$queryRaw(query);

    const metadata = calculateMetadataPagination({
      page: dto.page,
      pageSize: dto.pageSize,
      totalRecord: categories.length > 0 ? categories[0].resultCount : 0,
    });

    return {
      categories: categories.map((pc) => {
        const { resultCount, ...categories } = pc;
        return categories;
      }),
      metadata,
    };
  };
}
