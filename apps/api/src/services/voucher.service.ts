import { VoucherGetAllMeDTO } from '@/dtos/voucher-get-all-me.dto';
import { InternalSeverError } from '@/errors';
import { currentDate } from '@/helpers/datetime';
import { calculateMetadataPagination } from '@/helpers/pagination';
import { prismaclient } from '@/prisma';
import { Prisma, User, Voucher } from '@prisma/client';
import { z } from 'zod';

export class VoucherService {
  getAllMyVoucher = async (
    dto: z.infer<typeof VoucherGetAllMeDTO>,
    user: User,
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
                to_tsvector('simple', v."name") @@ to_tsquery('simple', ${term}) OR
                to_tsvector('simple', v."description") @@ to_tsquery('simple', ${term}) OR
                to_tsvector('simple', v."code") @@ to_tsquery('simple', ${term}) OR
                to_tsvector('simple', v."value") @@ to_tsquery('simple', ${term})
            )`
        : Prisma.empty;
    })();

    const orderBy = (() => {
      switch (dto.orderBy) {
        case 'createdAt':
          return Prisma.sql`"createdAt" ASC`;
        case '-createdAt':
          return Prisma.sql`"createdAt" DESC`;
        case 'startDate':
          return Prisma.sql`"startDate" ASC`;
        case '-startDate':
          return Prisma.sql`"startDate" DESC`;
        case 'endDate':
          return Prisma.sql`"endDate" ASC`;
        case '-endDate':
          return Prisma.sql`"endDate" DESC`;
      }
    })();

    const filterType = (() => {
      if (!dto.type) return Prisma.empty;

      const types = dto.type.map((type) => {
        switch (type) {
          case 'refferal':
            return Prisma.sql`v."type" = 'REFERRAL'`;
          case 'product-specific':
            return Prisma.sql`v."type" = 'PRODUCT_SPECIFIC'`;
          case 'shipping':
            return Prisma.sql`v."type" = 'SHIPPING'`;
        }
      });

      return Prisma.sql`AND ${Prisma.join(types, ' OR ')}`;
    })();

    const query = Prisma.sql`
        WITH filtered_vouchers AS (
          SELECT v."id", v."type", v."createdAt", v."startDate", v."endDate"
          FROM "Voucher" v
          LEFT JOIN "_UserVoucher" uv ON uv."B" = v."id"
          LEFT JOIN "User" u ON u."id" = uv."A"
          LEFT JOIN "_ProductVoucher" pv ON pv."B" = v."id"
          LEFT JOIN "Product" p ON p."id" = pv."A"
          WHERE
            v."isActive" = true AND
            v."endDate" >= ${currentDate()} AND
            u."id" = ${user.id} AND
            p."isActive" = true
            ${searchterm}
            ${filterType}
        ),
        voucher_page AS (
          SELECT fv."id"
          FROM filtered_vouchers fv
          ORDER BY ${orderBy}
          OFFSET ${(dto.page - 1) * dto.pageSize}
          LIMIT ${dto.pageSize}
        ),
        total_count AS (
          SELECT COUNT(*)::int AS "result_count" FROM (
            SELECT DISTINCT fv."id" FROM filtered_vouchers fv
          ) AS count_table
        )
        SELECT
          v."id" as "id",
          v."code" as "code",
          v."name" as "name",
          v."description" as "description",
          v."type" as "type",
          v."valueType" as "valueType",
          v."value" as "value",
          v."minPurchase" as "minPurchase",
          v."maxDiscount" as "maxDiscount",
          v."startDate" as "startDate",
          v."endDate" as "endDate",
          v."isActive" as "isActive",
          v."isForShipping" as "isForShipping",
          v."maxUsage" as "maxUsage",
          v."usageCount" as "usageCount",
          v."createdAt" as "createdAt",

          p."id" as "product_id",
          u."id" as "user_id",
          tc."result_count"

        FROM voucher_page vp;
        JOIN "Voucher" v ON vp."id" = v."id"
        LEFT JOIN "_UserVoucher" uv ON uv."B" = v."id"
        LEFT JOIN "User" u ON u."id" = uv."A"
        LEFT JOIN "_ProductVoucher" pv ON pv."B" = v."id"
        LEFT JOIN "Product" p ON p."id" = pv."A"
        JOIN total_count tc ON true
        ORDER BY ${orderBy}

    `;

    const result: any[] = await prismaclient.$queryRaw(query);

    const voucherMap = new Map<
      string,
      Voucher & { products: { id: string }[]; users: { id: string }[] }
    >();

    let resultCount = result.at(0)?.result_count || 0;

    for (const row of result) {
      if (!voucherMap.has(row.id)) {
        voucherMap.set(row.id, {
          id: row.id,
          code: row.code,
          name: row.name,
          description: row.description,
          type: row.type,
          valueType: row.valueType,
          value: row.value,
          minPurchase: row.minPurchase,
          maxDiscount: row.maxDiscount,
          startDate: row.startDate,
          endDate: row.endDate,
          isActive: row.isActive,
          isForShipping: row.isForShipping,
          maxUsage: row.maxUsage,
          usageCount: row.usageCount,
          createdAt: row.createdAt,
          products: [],
          users: [],
        });
      }

      if (row.user_id) {
        const voucher = voucherMap.get(row.id);
        if (!voucher) {
          throw new InternalSeverError(`Missing voucher id ${row.id}`);
        }
        const notAdded = !voucher.users.some((user) => user.id === row.user_id);
        if (notAdded) {
          voucher.users.push({
            id: row.user_id,
          });
        }
      }

      if (row.product_id) {
        const voucher = voucherMap.get(row.id);
        if (!voucher) {
          throw new InternalSeverError(`Missing voucher id ${row.id}`);
        }
        const notAdded = !voucher.products.some(
          (product) => product.id === row.product_id,
        );
        if (notAdded) {
          voucher.products.push({
            id: row.product_id,
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
      vouchers: Array.from(voucherMap.values()),
      metadata: metadata,
    };
  };
}
