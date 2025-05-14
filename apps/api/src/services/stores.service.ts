import { AddressCreateDTO } from '@/dtos/address-create.dto';
import { AddressUpdateDTO } from '@/dtos/address-update.dto';
import { StoreGetAllDTO } from '@/dtos/store-get-all.dto';
import { BadRequestError, NotFoundError } from '@/errors';
import { calculateMetadataPagination } from '@/helpers/pagination';
import { getSession } from '@/helpers/session-helper';
import { prismaclient } from '@/prisma';
import { Prisma, Store, User } from '@prisma/client';
import { Request } from 'express';
import { z } from 'zod';
import { LocationService } from './location.service';

export class StoreService {
  private locationService = new LocationService();

  createStore = async (dto: z.infer<typeof AddressCreateDTO>, req: Request) => {
    const session = getSession(req);

    const count = await prismaclient.address.count({
      where: {
        userId: session.user.id,
      },
    });
    if (count >= 100) {
      throw new BadRequestError(
        'Address limit exceeded: maximum of 100 records allowed',
      );
    }

    // const province = await this.locationService.provinceGetByName(dto.province);
    // const city = await this.locationService.cityGetByName(dto.city);

    if (dto.isPrimary) {
      const oldDefault = await prismaclient.address.findUnique({
        where: {
          isDefault: true,
          userId: session.user.id,
        },
      });
      if (oldDefault) {
        await prismaclient.address.update({
          where: {
            id: oldDefault.id,
          },
          data: {
            isDefault: null,
          },
        });
      }
    }

    const address = await prismaclient.address.create({
      data: {
        label: dto.label,
        address: dto.address,
        province: dto.province,
        city: dto.city,
        postalCode: dto.postalCode,
        isDefault: dto.isPrimary ? true : null,
        latitude: dto.latitude,
        longitude: dto.longitude,
        phone: dto.phone,
        recipient: dto.recipient,
        userId: session.user.id,
      },
    });

    return { address };
  };

  updateStore = async (dto: z.infer<typeof AddressUpdateDTO>, req: Request) => {
    const session = getSession(req);

    const address = await prismaclient.address.findUnique({
      where: {
        id: dto.addressId,
        userId: session.user.id,
      },
    });
    if (!address) throw new NotFoundError();

    if (dto.isPrimary) {
      const oldDefault = await prismaclient.address.findUnique({
        where: {
          isDefault: true,
          userId: session.user.id,
        },
      });
      if (oldDefault && oldDefault.id !== address.id) {
        await prismaclient.address.update({
          where: {
            id: oldDefault.id,
          },
          data: {
            isDefault: null,
          },
        });
      }
    }

    // const province = await this.locationService.provinceGetByName(dto.province);
    // const city = await this.locationService.cityGetByName(dto.city);

    const updated = await prismaclient.address.update({
      where: {
        id: dto.addressId,
        userId: session.user.id,
      },
      data: {
        label: dto.label,
        address: dto.address,
        province: dto.province,
        city: dto.city,
        postalCode: dto.postalCode,
        isDefault: dto.isPrimary ? true : null,
        latitude: dto.latitude,
        longitude: dto.longitude,
        phone: dto.phone,
        recipient: dto.recipient,
      },
    });

    return { address: updated };
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
    WHERE
      s."isActive" = true
      ${searchterm}
    ORDER BY a."createdAt" DESC
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

    const metadata = calculateMetadataPagination({
      page: dto.page,
      pageSize: dto.pageSize,
      totalRecord: resultCount,
    });

    return {
      stores,
      metadata,
    };
  };
}
