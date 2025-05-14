import { StoreChangeStatusDTO } from '@/dtos/store-chnage-status.dto';
import { StoreCreateDTO } from '@/dtos/store-create-dto';
import { StoreGetAllDTO } from '@/dtos/store-get-all.dto';
import { StoreGetByIdDTO } from '@/dtos/store-get-by-id.dto';
import { StoreUpdateDTO } from '@/dtos/store-update.dto';
import { NotFoundError } from '@/errors';
import { calculateMetadataPagination } from '@/helpers/pagination';
import { prismaclient } from '@/prisma';
import { Prisma, Store, User } from '@prisma/client';
import { z } from 'zod';

export class StoreService {
  createStore = async (dto: z.infer<typeof StoreCreateDTO>) => {
    const store = await prismaclient.store.create({
      data: {
        name: dto.name,
        address: dto.address,
        city: dto.city,
        province: dto.province,
        postalCode: dto.postalCode,
        latitude: dto.latitude,
        longitude: dto.longitude,
        maxDistance: dto.maxDistance,
        adminId: dto.adminId ? dto.adminId : null,
      },
    });

    if (dto.adminId) {
      await prismaclient.user.update({
        where: {
          id: dto.adminId,
        },
        data: {
          storeId: store.id,
        },
      });
    }
    return store;
  };

  updateStore = async (dto: z.infer<typeof StoreUpdateDTO>) => {
    const store = await prismaclient.store.findUnique({
      where: {
        id: dto.storeId,
      },
    });
    if (!store) throw new NotFoundError();

    const updatedStore = await prismaclient.store.update({
      where: {
        id: store.id,
      },
      data: {
        name: dto.name,
        address: dto.address,
        city: dto.city,
        province: dto.province,
        postalCode: dto.postalCode,
        latitude: dto.latitude,
        longitude: dto.longitude,
        maxDistance: dto.maxDistance,
        adminId: dto.adminId ? dto.adminId : null,
      },
    });

    if (store.adminId) {
      await prismaclient.user.update({
        where: {
          id: store.adminId,
        },
        data: {
          storeId: null,
        },
      });
    }
    if (dto.adminId) {
      await prismaclient.user.update({
        where: {
          id: dto.adminId,
        },
        data: {
          storeId: updatedStore.id,
        },
      });
    }

    return updatedStore;
  };

  getAllStore = async (dto: z.infer<typeof StoreGetAllDTO>) => {
    const searchterm = (() => {
      if (dto.query?.trim()) {
        const token = dto.query
          .trim()
          .split(/\s+/)
          .map((term) => `${term}:*`)
          .join(' & ');

        const query = Prisma.sql`
          (
            to_tsvector('simple', s."name") @@ to_tsquery('simple', ${token}) OR
            to_tsvector('simple', s."address") @@ to_tsquery('simple', ${token}) OR
            to_tsvector('simple', s."city") @@ to_tsquery('simple', ${token}) OR
            to_tsvector('simple', s."province") @@ to_tsquery('simple', ${token})
          )
        `;
        return Prisma.sql`AND ${query}`;
      }
      return Prisma.sql``;
    })();

    const query = Prisma.sql`
    SELECT 
      (COUNT(*) OVER())::int as "result_count",
      s."id", 
      s."name", 
      s."address", 
      s."city", 
      s."province", 
      s."postalCode", 
      s."latitude", 
      s."longitude", 
      s."maxDistance", 
      s."isMain", 
      s."isActive",
      s."createdAt", 
      s."updatedAt", 
      s."adminId",
      
      a."id" as "admin_id", 
      a."role" as "admin_role", 
      a."name" as "admin_name",
      a."email" as "admin_email",
      a."emailVerified" as "admin_emailVerified",
      a."image" as "admin_image",
      a."phone" as "admin_phone",
      a."gender" as "admin_gender",
      a."dateOfBirth" as "admin_dateOfBirth",
      a."signupMethod" as "admin_signupMethod",
      a."createdAt" as "admin_createdAt",
      a."updatedAt" as "admin_updatedAt",
      a."referralCode" as "admin_referralCode",
      a."referredById" as "admin_referredById",
      a."storeId" as "admin_storeId"
    FROM "Store" as s 
    LEFT JOIN "User" a ON s."adminId" = a."id"
    WHERE true
      ${searchterm}
    ORDER BY s."createdAt" DESC
    OFFSET ${(dto.page - 1) * dto.pageSize}
    LIMIT ${dto.pageSize}`;

    const result: any = await prismaclient.$queryRaw(query);

    let resultCount = result.at(0)?.result_count || 0;

    const storeMap = new Map<
      string,
      Store & {
        admin?: User;
      }
    >();

    for (const row of result) {
      if (!storeMap.has(row.id)) {
        storeMap.set(row.id, {
          id: row.id,
          name: row.name,
          address: row.address,
          city: row.city,
          province: row.province,
          postalCode: row.postalCode,
          latitude: row.latitude,
          longitude: row.longitude,
          maxDistance: row.maxDistance,
          isMain: row.isMain,
          isActive: row.isActive,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          adminId: row.adminId,
        });
      }

      const admin = row.admin_id
        ? {
            id: row.admin_id,
            role: row.admin_role,
            name: row.admin_name,
            email: row.admin_email,
            emailVerified: row.admin_emailVerified,
            image: row.admin_image,
            phone: row.admin_phone,
            gender: row.admin_gender,
            dateOfBirth: row.admin_dateOfBirth,
            signupMethod: row.admin_signupMethod,
            createdAt: row.admin_createdAt,
            updatedAt: row.admin_updatedAt,
            referralCode: row.admin_referralCode,
            referredById: row.admin_referredById,
            storeId: row.admin_storeId,
          }
        : undefined;

      const store = storeMap.get(row.id);
      if (store && admin) {
        store.admin = admin;
      }
    }

    const stores = Array.from(storeMap.values());

    const activeStore = await prismaclient.store.count({
      where: {
        isActive: true,
      },
    });
    const inactiveStore = await prismaclient.store.count({
      where: {
        isActive: false,
      },
    });

    const metadata = calculateMetadataPagination({
      page: dto.page,
      pageSize: dto.pageSize,
      totalRecord: resultCount,
    });

    return {
      stores,
      extension: {
        totalStore: activeStore + inactiveStore,
        activeStore: activeStore,
        inactiveStore: inactiveStore,
      },
      metadata,
    };
  };
  changeStatus = async (dto: z.infer<typeof StoreChangeStatusDTO>) => {
    const store = await prismaclient.store.findUnique({
      where: {
        id: dto.storeId,
      },
    });
    if (!store) throw new NotFoundError();

    return await prismaclient.store.update({
      where: {
        id: store.id,
      },
      data: {
        isActive: dto.status,
      },
    });
  };

  getById = async (dto: z.infer<typeof StoreGetByIdDTO>) => {
    const store = await prismaclient.store.findUnique({
      where: {
        id: dto.storeId,
      },
      include: {
        admin: true,
      },
    });

    if (!store) throw new NotFoundError();
    return store;
  };
}
