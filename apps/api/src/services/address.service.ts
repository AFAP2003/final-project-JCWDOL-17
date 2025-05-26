import { AddressCreateDTO } from '@/dtos/address-create.dto';
import { AddressDeleteDTO } from '@/dtos/address-delete.dto';
import { AddressGetAllDTO } from '@/dtos/address-get-all.dto';
import { AddressUpdateDTO } from '@/dtos/address-update.dto';
import { BadRequestError, NotFoundError } from '@/errors';
import { calculateMetadataPagination } from '@/helpers/pagination';
import { getSession } from '@/helpers/session-helper';
import { prismaclient } from '@/prisma';
import { Address, Prisma } from '@prisma/client';
import { Request } from 'express';
import { z } from 'zod';
import { LocationService } from './location.service';

export class AddressService {
  private locationService = new LocationService();

  createAddress = async (
    dto: z.infer<typeof AddressCreateDTO>,
    req: Request,
  ) => {
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
      const oldDefault = await prismaclient.address.findFirst({
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
            isDefault: false,
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
        isDefault: dto.isPrimary,
        latitude: dto.latitude,
        longitude: dto.longitude,
        phone: dto.phone,
        recipient: dto.recipient,
        userId: session.user.id,
      },
    });

    return { address };
  };

  updateAddress = async (
    dto: z.infer<typeof AddressUpdateDTO>,
    req: Request,
  ) => {
    const session = getSession(req);

    const address = await prismaclient.address.findUnique({
      where: {
        id: dto.addressId,
        userId: session.user.id,
      },
    });
    if (!address) throw new NotFoundError();

    if (dto.isPrimary) {
      const oldDefault = await prismaclient.address.findFirst({
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
            isDefault: false,
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
        isDefault: dto.isPrimary,
        latitude: dto.latitude,
        longitude: dto.longitude,
        phone: dto.phone,
        recipient: dto.recipient,
      },
    });

    return { address: updated };
  };

  getAllAddress = async (
    dto: z.infer<typeof AddressGetAllDTO>,
    req: Request,
  ) => {
    const session = getSession(req);
    const searchterm = (() => {
      if (dto.query?.trim()) {
        const token = dto.query
          .trim()
          .split(/\s+/)
          .map((term) => `${term}:*`)
          .join(' & ');

        const query = Prisma.sql`
          (
            to_tsvector('simple', a."label") @@ to_tsquery('simple', ${token}) OR
            to_tsvector('simple', a."address") @@ to_tsquery('simple', ${token}) OR
            to_tsvector('simple', a."city") @@ to_tsquery('simple', ${token}) OR
            to_tsvector('simple', a."province") @@ to_tsquery('simple', ${token})
          )
        `;
        return Prisma.sql`AND ${query}`;
      }
      return Prisma.sql``;
    })();

    const query = Prisma.sql`
    SELECT 
      (COUNT(*) OVER())::int as "count",
      a."id", a."isDefault", a."label", a."address",
      a."city", a."province", a."postalCode", a."recipient",
      a."phone", a."latitude", a."longitude", a."createdAt",
      a."updatedAt", a."userId"
    FROM "Address" as a
    WHERE
      a."userId" = ${session.user.id} AND
      a."isActive" = true
      ${searchterm}
    ORDER BY a."isDefault" DESC, a."createdAt" DESC
    OFFSET ${(dto.page - 1) * dto.pageSize}
    LIMIT ${dto.pageSize}`;

    const addresses: (Address & { count: number })[] =
      await prismaclient.$queryRaw(query);

    const metadata = calculateMetadataPagination({
      page: dto.page,
      pageSize: dto.pageSize,
      totalRecord: addresses.length > 0 ? addresses[0].count : 0,
    });

    return {
      addresses: addresses.map((ad) => {
        const { count, ...address } = ad;
        return address;
      }),
      metadata,
    };
  };

  deleteAddress = async (
    dto: z.infer<typeof AddressDeleteDTO>,
    req: Request,
  ) => {
    const session = getSession(req);
    const address = await prismaclient.address.findUnique({
      where: {
        id: dto.addressId,
        userId: session.user.id,
      },
    });
    if (!address) throw new NotFoundError();

    return await prismaclient.address.update({
      where: {
        id: address.id,
      },
      data: {
        isActive: false,
        isDefault: false,
      },
    });
  };
}
