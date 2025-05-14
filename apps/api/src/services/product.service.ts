import { ProductGetAllDTO } from '@/dtos/product-get-all.dto';
import { ProductGetByIdDTO } from '@/dtos/product-get-by-id.dto';
import { InternalSeverError, NotFoundError } from '@/errors';
import { currentDate } from '@/helpers/datetime';
import { calculateMetadataPagination } from '@/helpers/pagination';
import { prismaclient } from '@/prisma';
import {
  Category,
  Discount,
  Prisma,
  Product,
  ProductImage,
} from '@prisma/client';
import { z } from 'zod';

export class ProductService {
  getAll = async (
    dto: z.infer<typeof ProductGetAllDTO>,
    option?: {
      excludeIds: string[];
    },
  ) => {
    const searchterm = (() => {
      const term = dto.query?.trim()
        ? dto.query
            .trim()
            .split(/\s+/)
            .map((term) => `${term}:*`)
            .join(' & ')
        : null;

      return term
        ? Prisma.sql`AND (
            to_tsvector('simple', p."name") @@ to_tsquery('simple', ${term}) OR
            to_tsvector('simple', p."description") @@ to_tsquery('simple', ${term})
        )`
        : Prisma.empty;
    })();

    const orderBy = (() => {
      switch (dto.orderBy) {
        case 'createdAt':
          return Prisma.sql`"createdAt" ASC`;
        case '-createdAt':
          return Prisma.sql`"createdAt" DESC`;
        case 'price':
          return Prisma.sql`"price" ASC`;
        case '-price':
          return Prisma.sql`"price" DESC`;
      }
    })();

    const filterPromo = (() => {
      if (!dto.promo) {
        return Prisma.sql`AND (
          d."id" IS NULL OR (
            d."isActive" = true AND
            d."endDate" > ${currentDate()}
          )
        )`;
      }

      const promos = dto.promo.map((pr) => {
        switch (pr) {
          case 'bogo':
            return Prisma.sql`d."type" = 'BUY_X_GET_Y'`;
          case 'max-price':
            return Prisma.sql`d."type" = 'WITH_MAX_PRICE'`;
          case 'no-rules':
            return Prisma.sql`d."type" = 'NO_RULES_DISCOUNT'`;
        }
      });

      return Prisma.sql`AND ${Prisma.join(promos, ' OR ')} AND d."isActive" = true AND d."endDate" > ${currentDate()}`;
    })();

    const filterPrice = (() => {
      if (!dto.price) return Prisma.empty;

      const hasLowerBound = dto.price[0] > 0;
      const hasUpperBound = dto.price[1] > 0;

      const builder: Prisma.Sql[] = [];

      if (hasLowerBound) {
        builder.push(Prisma.sql`p."price" >= ${dto.price[0]}::DECIMAL`);
      }

      if (hasUpperBound) {
        builder.push(Prisma.sql`p."price" <= ${dto.price[1]}::DECIMAL`);
      }

      if (!builder.length) {
        return Prisma.empty;
      }
      return Prisma.sql`AND ${Prisma.join(builder, ' AND ')}`;
    })();

    const filterCategory = (() => {
      if (!dto.category || dto.category.length <= 0) {
        return Prisma.empty;
      }

      const builder: Prisma.Sql[] = [];
      dto.category.forEach((name) => {
        builder.push(Prisma.sql`c."name" = ${name}`);
      });
      return Prisma.sql`AND (${Prisma.join(builder, ' OR ')})`;
    })();

    const exclude = (() => {
      if (!option?.excludeIds || option.excludeIds.length === 0) {
        return Prisma.empty;
      }

      const ids = option.excludeIds.map((id) => Prisma.sql`${id}`);
      return Prisma.sql`AND p."id" NOT IN (${Prisma.join(ids, ', ')})`;
    })();

    const query = Prisma.sql`
      WITH filtered_products AS (
        SELECT p."id", p."createdAt", p."price"
        FROM "Product" p
        JOIN "Category" c ON p."categoryId" = c.id
        LEFT JOIN "_ProductDiscount" pd ON pd."B" = p.id
        LEFT JOIN "Discount" d ON d.id = pd."A"
        WHERE
          p."isActive" = true AND c."isActive" = true
          ${searchterm}
          ${filterPrice}
          ${filterPromo}
          ${filterCategory}
          ${exclude}
      ),
      product_page AS (
        SELECT fp."id"
        FROM filtered_products fp
        ORDER BY ${orderBy}
        OFFSET ${(dto.page - 1) * dto.pageSize}
        LIMIT ${dto.pageSize}
      ),
      total_count AS (
        SELECT COUNT(*)::int AS "result_count" FROM (
          SELECT DISTINCT fp."id" FROM filtered_products fp
        ) AS count_table
      )
      SELECT 
        p."id" AS "id",
        p."name" AS "name",
        p."description" AS "description",
        p."price" AS "price",
        p."weight" AS "weight",
        p."sku" AS "sku",
        p."categoryId" AS "categoryId",
        p."isActive" AS "isActive",
        p."createdAt" AS "createdAt",
        p."updatedAt" AS "updatedAt",
      
        c."id" AS "category_id",
        c."name" AS "category_name",
        c."description" AS "category_description",
        c."image" AS "category_image",
        c."isActive" AS "category_isActive",
        c."createdAt" AS "category_createdAt",
        c."updatedAt" AS "category_updatedAt",
      
        pi."id" AS "image_id",
        pi."imageUrl" AS "image_url",
        pi."isMain" AS "image_isMain",
        pi."createdAt" AS "image_createdAt",
      
        d."id" AS "discount_id",
        d."storeId" AS "discount_storeId",
        d."name" AS "discount_name",
        d."description" AS "discount_description",
        d."type" AS "discount_type",
        d."value" AS "discount_value",
        d."isPercentage" AS "discount_isPercentage",
        d."minPurchase" AS "discount_minPurchase",
        d."maxDiscount" AS "discount_maxDiscount",
        d."buyQuantity" AS "discount_buyQuantity",
        d."getQuantity" AS "discount_getQuantity",
        d."startDate" AS "discount_startDate",
        d."endDate" AS "discount_endDate",
        d."isActive" AS "discount_isActive",
        d."createdAt" AS "discount_createdAt",
        d."updatedAt" AS "discount_updatedAt",
        
        tc."result_count"
      FROM product_page pp
      JOIN "Product" p ON p.id = pp.id
      JOIN "Category" c ON p."categoryId" = c.id
      LEFT JOIN "ProductImage" pi ON pi."productId" = p.id
      LEFT JOIN "_ProductDiscount" pd ON pd."B" = p.id
      LEFT JOIN "Discount" d ON d.id = pd."A"
      JOIN total_count tc ON true
      ORDER BY ${orderBy}
      `;

    const result: any[] = await prismaclient.$queryRaw(query);

    const productsMap = new Map<
      string,
      Product & {
        category: Category;
        images: ProductImage[];
        discounts: Discount[];
      }
    >();
    let resultCount = result.at(0)?.result_count || 0;

    for (const row of result) {
      if (!productsMap.has(row.id)) {
        productsMap.set(row.id, {
          id: row.id,
          name: row.name,
          description: row.description,
          price: row.price,
          weight: row.weight,
          sku: row.sku,
          categoryId: row.categoryId,
          isActive: row.isActive,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          category: {
            id: row.category_id,
            name: row.category_name,
            description: row.category_description,
            image: row.category_image,
            isActive: row.category_isActive,
            createdAt: row.category_createdAt,
            updatedAt: row.category_updatedAt,
          },
          images: [],
          discounts: [],
        });
      }

      if (row.image_id) {
        const product = productsMap.get(row.id);
        if (!product) {
          throw new InternalSeverError(`Missing product id ${row.id}`);
        }

        if (!product.images.some((image) => image.id === row.image_id)) {
          productsMap.get(row.id)!.images.push({
            id: row.image_id,
            productId: row.id,
            imageUrl: row.image_url,
            isMain: row.image_isMain,
            createdAt: row.image_createdAt,
          });
        }
      }

      if (row.discount_id) {
        const product = productsMap.get(row.id);
        if (!product) {
          throw new InternalSeverError(`Missing product id ${row.id}`);
        }

        if (
          !product.discounts.some((discount) => discount.id === row.discount_id)
        ) {
          productsMap.get(row.id)!.discounts.push({
            id: row.discount_id,
            storeId: row.discount_storeId,
            name: row.discount_name,
            description: row.discount_description,
            type: row.discount_type,
            value: row.discount_value,
            isPercentage: row.discount_isPercentage,
            minPurchase: row.discount_minPurchase,
            maxDiscount: row.discount_maxDiscount,
            buyQuantity: row.discount_buyQuantity,
            getQuantity: row.discount_getQuantity,
            startDate: row.discount_startDate,
            endDate: row.discount_endDate,
            isActive: row.discount_isActive,
            createdAt: row.discount_createdAt,
            updatedAt: row.discount_updatedAt,
          });
        }
      }
    }

    const metadata = calculateMetadataPagination({
      page: dto.page,
      pageSize: dto.pageSize,
      totalRecord: resultCount > 0 ? resultCount : 0,
    });

    return {
      products: Array.from(productsMap.values()),
      metadata: metadata,
    };
  };

  getById = async (dto: z.infer<typeof ProductGetByIdDTO>) => {
    const product = await prismaclient.product.findUnique({
      where: {
        id: dto.productId,
      },
      include: {
        images: true,
        category: true,
        discounts: true,
      },
    });
    if (!product) throw new NotFoundError();

    return product;
  };
}
