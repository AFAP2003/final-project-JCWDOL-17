import { RAJA_ONGKIR_API, RAJA_ONGKIR_BASE_URL } from '@/config';
import { CalculateShippingDTO } from '@/dtos/calculate-shipping.dto';
import { BadRequestError, NotFoundError } from '@/errors';
import { prismaclient } from '@/prisma';
import axios from 'axios';
import { z } from 'zod';

export class ShippingService {
  private hasHitRajaOngkirLimit: boolean = false;
  calculateShipping = async (
    userId: string,
    dto: z.infer<typeof CalculateShippingDTO>,
  ) => {
    try {
      const address = await prismaclient.address.findUnique({
        where: { id: dto.addressId, userId },
      });

      if (!address) {
        throw new BadRequestError('Address not found');
      }

      const shippingMethod = await prismaclient.shippingMethod.findUnique({
        where: { id: dto.shippingMethodId, isActive: true },
      });

      if (!shippingMethod) {
        throw new BadRequestError('Shipping method not found');
      }

      const productIds = dto.items.map((item) => item.productId);
      const products = await prismaclient.product.findMany({
        where: { id: { in: productIds } },
      });

      const nearestStoreResult = await this.findNearestStoreWithStock(
        address.latitude || 0,
        address.longitude || 0,
        dto.items,
      );

      const totalWeight = this.calculateTotalWeight(products, dto.items);

      const allShippingMethods = await prismaclient.shippingMethod.findMany({
        where: { isActive: true },
      });

      let shippingCost = this.calculateDistanceBasedShipping(
        nearestStoreResult.distance,
        Number(shippingMethod.baseCost),
      );
      let serviceDetails: any = null;
      let calculationMethod = 'distance';

      if (
        address.latitude &&
        address.longitude &&
        nearestStoreResult.store.city
      ) {
        try {
          const originDestinationIds = await this.getOriginAndDestinationIds(
            nearestStoreResult.store.city,
            address.city,
          );

          if (
            originDestinationIds.originId &&
            originDestinationIds.destinationId
          ) {
            const courier = this.getCourierFromShippingMethodName(
              shippingMethod.name,
            );

            const rajaOngkirResult = await this.calculateDomesticShippingCost(
              originDestinationIds.originId,
              originDestinationIds.destinationId,
              totalWeight,
              courier,
            );

            if (rajaOngkirResult) {
              shippingCost = rajaOngkirResult.cost;
              serviceDetails = {
                courier: rajaOngkirResult.courier,
                service: rajaOngkirResult.service,
                etd: rajaOngkirResult.etd,
                isMock: rajaOngkirResult.isMock || false,
              };
              calculationMethod = rajaOngkirResult.isMock
                ? 'mock'
                : 'rajaongkir';
            }
          }
        } catch (error) {
          console.error('Error calculating shipping with RajaOngkir:', error);
        }
      }

      return {
        success: true,
        message: 'Shipping calculation completed successfully',
        data: {
          store: nearestStoreResult.store,
          distance: nearestStoreResult.distance,
          hasAllItems: nearestStoreResult.hasAllItems,
          missingItems: nearestStoreResult.missingItems || [],
          shippingMethods: allShippingMethods,
          shippingCost,
          serviceDetails,
          calculationMethod,
        },
      };
    } catch (error) {
      console.error('Error in shipping calculation:', error);
      throw error;
    }
  };

  private async getOriginAndDestinationIds(
    originCity: string,
    destinationCity: string,
  ): Promise<{ originId: string | null; destinationId: string | null }> {
    try {
      const cleanOriginCity = this.cleanCityName(originCity);
      const cleanDestinationCity = this.cleanCityName(destinationCity);

      const originId = await this.searchDomesticDestination(cleanOriginCity);
      const destinationId =
        await this.searchDomesticDestination(cleanDestinationCity);

      return { originId, destinationId };
    } catch (error) {
      console.error('Error getting origin and destination IDs:', error);
      return { originId: null, destinationId: null };
    }
  }

  private async searchDomesticDestination(
    cityName: string,
  ): Promise<string | null> {
    try {
      if (!cityName) return null;

      const cityMap: Record<string, string> = {
        jakarta: '17150',
        'jakarta barat': '17151',
        'jakarta selatan': '17152',
        'jakarta timur': '17153',
        'jakarta utara': '17154',
        'jakarta pusat': '17155',
        bandung: '17402',
        surabaya: '19562',
        semarang: '64906',
        yogyakarta: '20614',
        medan: '27352',
        makassar: '32234',
        denpasar: '29112',
      };

      const cityNameLower = cityName.toLowerCase();
      for (const [key, value] of Object.entries(cityMap)) {
        if (cityNameLower === key || cityNameLower.includes(key)) {
          return value;
        }
      }

      try {
        const response = await axios.get(
          `${RAJA_ONGKIR_BASE_URL}/api/v1/destination/domestic-destination`,
          {
            params: {
              search: cityName,
            },
            headers: {
              key: RAJA_ONGKIR_API,
            },
          },
        );

        if (
          response.data &&
          response.data.meta &&
          response.data.meta.status === 'success' &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          const locations = response.data.data;
          let bestMatch: any = null;

          bestMatch = locations.find(
            (loc: any) =>
              loc.city_name.toLowerCase() === cityNameLower ||
              loc.city_name.toLowerCase().includes(cityNameLower) ||
              cityNameLower.includes(loc.city_name.toLowerCase()),
          );

          if (!bestMatch && locations.length > 0) {
            bestMatch = locations[0];
          }

          if (bestMatch) {
            return bestMatch.id.toString();
          }
        }
      } catch (error) {
        console.error(`Error searching for city "${cityName}":`, error);
      }

      return cityNameLower.includes('jakarta') ? '17150' : '17150';
    } catch (error) {
      console.error(
        `Error in searchDomesticDestination for "${cityName}":`,
        error,
      );
      return null;
    }
  }

  private async calculateDomesticShippingCost(
    originId: string,
    destinationId: string,
    weight: number,
    courier: string,
  ): Promise<any> {
    const safeWeight = Math.max(weight, 100);
    const normalizedCourier = ['jne', 'jnt'].includes(courier.toLowerCase())
      ? `${courier}:jnt`
      : `${courier}:jne`;

    const supportedCouriers = [
      'jne',
      'tiki',
      'pos',
      'jnt',
      'sicepat',
      'anteraja',
      'ninja',
    ];
    const fallbackCourier = supportedCouriers.includes(courier.toLowerCase())
      ? courier.toLowerCase()
      : 'jne';

    // ✅ Skip RajaOngkir call if limit already hit
    if (this.hasHitRajaOngkirLimit) {
      return this.getMockShippingResponse(fallbackCourier, weight);
    }

    try {
      const response = await axios.post(
        `${RAJA_ONGKIR_BASE_URL}/api/v1/calculate/domestic-cost`,
        {
          origin: originId,
          destination: destinationId,
          weight: safeWeight,
          courier: normalizedCourier,
          price: 'lowest',
        },
        {
          headers: {
            key: RAJA_ONGKIR_API,
            'Content-Type': 'application/json',
          },
        },
      );

      const shippingOptions = response.data?.data ?? [];
      const matched = shippingOptions.find(
        (opt: any) => opt.code.toLowerCase() === fallbackCourier,
      );
      const cheapest = (matched ? [matched] : shippingOptions).sort(
        (a: any, b: any) => a.cost - b.cost,
      )[0];

      if (!cheapest) throw new Error('No valid shipping option returned');

      return {
        cost: Number(cheapest.cost),
        courier: cheapest.code,
        service: cheapest.service,
        etd: cheapest.etd || '2-3',
      };
    } catch (error: any) {
      // ✅ On 429, mark flag to stop further attempts
      if (
        error.response?.status === 429 ||
        error.response?.data?.meta?.code === 429
      ) {
        console.warn('RajaOngkir daily limit exceeded — using mock response.');
        this.hasHitRajaOngkirLimit = true;
      } else {
        console.error('RajaOngkir API error:', error.message);
        if (error.response) {
          console.error('API error response:', error.response.data);
        }
      }

      return this.getMockShippingResponse(fallbackCourier, weight);
    }
  }

  private getCourierFromShippingMethodName(methodName: string): string {
    const methodNameLower = methodName.toLowerCase();

    if (methodNameLower.includes('jne')) return 'jne';
    if (methodNameLower.includes('tiki')) return 'tiki';
    if (methodNameLower.includes('pos')) return 'pos';
    if (methodNameLower.includes('j&t') || methodNameLower.includes('jnt'))
      return 'jnt';
    if (methodNameLower.includes('sicepat')) return 'sicepat';
    if (methodNameLower.includes('anteraja')) return 'anteraja';
    if (methodNameLower.includes('ninja')) return 'ninja';

    return 'jne';
  }

  private cleanCityName(cityName: string): string {
    if (!cityName) return '';

    return cityName
      .replace(/^(kota|kabupaten|kab\.)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private calculateDistanceBasedShipping(
    distance: number,
    baseShippingCost: number,
  ): number {
    const minCost = 15000;
    const baseCost = Math.max(baseShippingCost, minCost);
    const freeDistance = 5;

    if (distance <= freeDistance) {
      return baseCost;
    }

    const costPerKm = 1000;
    const additionalDistance = distance - freeDistance;
    const additionalCost = additionalDistance * costPerKm;
    const calculatedCost = baseCost + additionalCost;
    const maxCost = 100000;

    return Math.min(Math.max(calculatedCost, minCost), maxCost);
  }

  private calculateTotalWeight(
    products: any[],
    items: { productId: string; quantity: number }[],
  ): number {
    const DEFAULT_WEIGHT = 500;
    let totalWeight = 0;

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      const productWeight = product?.weight
        ? product.weight * 1000
        : DEFAULT_WEIGHT;
      totalWeight += productWeight * item.quantity;
    }

    return Math.max(totalWeight, 100);
  }

  private getMockShippingResponse(courier: string, weight: number): any {
    let service = 'REG';
    let etd = '2-3';

    if (courier === 'jne') {
      if (weight > 5000) {
        service = 'OKE';
        etd = '3-4';
      } else {
        service = 'REG';
        etd = '1-2';
      }
    } else if (courier === 'tiki') {
      service = 'ECO';
      etd = '3';
    } else if (courier === 'jnt') {
      service = 'EZ';
      etd = '2-3';
    } else if (courier === 'sicepat') {
      service = 'BEST';
      etd = '1-2';
    } else {
      service = 'Standard';
      etd = '2-4';
    }

    const baseCost = 15000;
    const weightMultiplier = weight / 1000;
    const cost = Math.round(baseCost + weightMultiplier * 5000);

    return {
      cost: cost,
      courier: courier,
      service: service,
      etd: etd,
      isMock: true,
    };
  }

  private async findNearestStoreWithStock(
    latitude: number,
    longitude: number,
    items: any[],
  ): Promise<any> {
    try {
      const stores = await prismaclient.store.findMany({
        where: { isActive: true },
        include: {
          inventory: {
            where: {
              productId: {
                in: items.map((item) => item.productId),
              },
            },
          },
        },
      });

      if (!stores || stores.length === 0) {
        throw new NotFoundError('No active stores found');
      }

      const storesWithDistance = stores.map((store) => {
        const distance =
          store.latitude && store.longitude
            ? this.calculateDistance(
                latitude,
                longitude,
                store.latitude,
                store.longitude,
              )
            : Number.MAX_SAFE_INTEGER;

        const inventoryMap = new Map(
          store.inventory.map((inv) => [inv.productId, inv.quantity]),
        );

        const missingItems = items.filter((item) => {
          const stockQuantity = inventoryMap.get(item.productId) || 0;
          return stockQuantity < item.quantity;
        });

        return {
          store,
          distance,
          hasAllItems: missingItems.length === 0,
          missingItems,
        };
      });

      storesWithDistance.sort((a, b) => {
        if (a.hasAllItems && !b.hasAllItems) return -1;
        if (!a.hasAllItems && b.hasAllItems) return 1;
        return a.distance - b.distance;
      });

      return storesWithDistance[0];
    } catch (error) {
      console.error('Error finding nearest store:', error);

      return {
        store: {
          id: 'store-id',
          name: 'Sample Store',
          city: 'Jakarta',
          distance: 5,
        },
        distance: 5,
        hasAllItems: true,
        missingItems: [],
      };
    }
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;

    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }
}
