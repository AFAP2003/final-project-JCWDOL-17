import { StoreCheckStockDTO } from '@/dtos/store-check-stock.dto';
import { StoreFindNearestDTO } from '@/dtos/store-find-nearest.dto';
import { InternalSeverError } from '@/errors';
import { prismaclient } from '@/prisma';
import * as geolib from 'geolib';
import { z } from 'zod';

export class StoreService {
  findNearest = async (dto: z.infer<typeof StoreFindNearestDTO>) => {
    const stores = await prismaclient.store.findMany();

    const nearest = geolib.findNearest(
      {
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
      stores.map((s) => ({
        latitude: s.latitude,
        longitude: s.longitude,
      })),
    ) as { latitude: number; longitude: number };

    const nearestStore = stores.find(
      (s) =>
        s.latitude === nearest.latitude && s.longitude === nearest.longitude,
    );
    if (!nearestStore) {
      throw new InternalSeverError('Nearest store should be found!');
    }

    const isWithinRadius = geolib.isPointWithinRadius(
      {
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
      {
        latitude: nearestStore.latitude,
        longitude: nearestStore.longitude,
      },
      nearestStore.maxDistance * 1000, //to be km
    );

    if (!isWithinRadius) {
      return null;
    }
    return nearestStore;
  };

  checkStock = async (dto: z.infer<typeof StoreCheckStockDTO>) => {
    const inventories = await prismaclient.inventory.findMany({
      where: {
        storeId: dto.storeId,
        productId: {
          in: dto.products.map((p) => p.productId),
        },
      },
    });

    if (!inventories.length) {
      return {
        inStocks: [],
        outStocks: dto.products.map((p) => p.productId),
      };
    }

    const inStocks: string[] = [];
    const outStocks: string[] = [];

    for (const product of dto.products) {
      const inventory = inventories.find(
        (inv) => inv.productId === product.productId,
      );

      if (inventory && inventory.quantity >= product.quantity) {
        inStocks.push(product.productId);
      } else {
        outStocks.push(product.productId);
      }
    }

    return {
      inStocks,
      outStocks,
    };
  };
}
