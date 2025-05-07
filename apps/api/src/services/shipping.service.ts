import { BadRequestError, NotFoundError } from '@/errors';
import { prismaclient } from '@/prisma';
import { RAJA_ONGKIR_API } from '@/config';
import axios from 'axios';
import { z } from 'zod';
import { CalculateShippingDTO } from '@/dtos/calculate-shipping.dto';

export class ShippingService {
  calculateShipping = async (
    userId: string,
    dto: z.infer<typeof CalculateShippingDTO>,
  ) => {
    // Get user address
    const address = await prismaclient.address.findUnique({
      where: {
        id: dto.addressId,
        userId,
      },
    });

    if (!address) {
      throw new BadRequestError('Address not found');
    }

    // Get shipping method
    const shippingMethod = await prismaclient.shippingMethod.findUnique({
      where: {
        id: dto.shippingMethodId,
        isActive: true,
      },
    });

    if (!shippingMethod) {
      throw new BadRequestError('Shipping method not found');
    }

    // Find nearest store with stock
    const nearestStoreResult = await this.findNearestStoreWithStock(
      address.latitude ?? 0,
      address.longitude ?? 0,
      dto.items,
    );

    // We'll use the base cost from ShippingMethod as a fallback
    // but try to get a more accurate cost from RajaOngkir
    let shippingCost = Number(shippingMethod.baseCost);
    let serviceDetails = null;

    try {
      // Get shipping cost using RajaOngkir
      const shippingDetails = await this.getShippingCostFromRajaOngkir(
        nearestStoreResult.store.city, // origin city
        address.city, // destination city
        this.getCourierFromShippingMethodName(shippingMethod.name), // Derive courier from method name
        this.calculateTotalWeight(dto.items), // weight in grams
      );

      if (shippingDetails) {
        shippingCost = shippingDetails.cost;
        serviceDetails = {
          courier: shippingDetails.courier,
          service: shippingDetails.service,
          etd: shippingDetails.etd,
        };
      }
    } catch (error) {
      console.error('Error getting shipping cost from RajaOngkir', error);
      // Fall back to base cost and distance-based calculation
      shippingCost = this.calculateDistanceBasedShipping(
        nearestStoreResult.distance,
        Number(shippingMethod.baseCost),
      );
    }

    // Return shipping calculation result
    return {
      store: nearestStoreResult.store,
      distance: nearestStoreResult.distance,
      hasAllItems: nearestStoreResult.hasAllItems,
      missingItems: nearestStoreResult.missingItems,
      shippingCost,
      serviceDetails,
    };
  };

  private async getShippingCostFromRajaOngkir(
    originCity: string,
    destinationCity: string,
    courier: string,
    weight: number,
  ) {
    try {
      // First, get city IDs
      const originCityId = await this.getCityIdByName(originCity);
      const destinationCityId = await this.getCityIdByName(destinationCity);

      if (!originCityId || !destinationCityId) {
        throw new BadRequestError('Invalid city name');
      }

      // Calculate shipping cost
      const response = await axios.post(
        'https://api.rajaongkir.com/starter/cost',
        {
          origin: originCityId,
          destination: destinationCityId,
          weight: weight,
          courier: courier.toLowerCase(),
        },
        {
          headers: {
            key: RAJA_ONGKIR_API,
            'content-type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const result = response.data.rajaongkir;

      if (result.status.code !== 200) {
        throw new BadRequestError('Failed to calculate shipping cost');
      }

      // Get the first available service
      const costs = result.results[0].costs;
      if (!costs || costs.length === 0) {
        return null;
      }

      // Return the shipping cost info
      return {
        cost: costs[0].cost[0].value,
        courier: result.results[0].code,
        service: costs[0].service,
        etd: costs[0].cost[0].etd,
      };
    } catch (error) {
      console.error('RajaOngkir API error:', error);
      return null;
    }
  }

  private async getCityIdByName(cityName: string): Promise<string | null> {
    try {
      // Clean the city name (remove "Kota", "Kabupaten", etc.)
      const cleanedCityName = cityName
        .replace(/^(kota|kabupaten)\s+/i, '')
        .trim();

      const response = await axios.get(
        'https://api.rajaongkir.com/starter/city',
        {
          headers: { key: RAJA_ONGKIR_API },
        },
      );

      const cities = response.data.rajaongkir.results;

      // Find matching city
      const city = cities.find(
        (city: any) =>
          city.city_name.toLowerCase() === cleanedCityName.toLowerCase(),
      );

      return city ? city.city_id : null;
    } catch (error) {
      console.error('Error getting city ID:', error);
      return null;
    }
  }

  // Function to derive courier code from shipping method name
  private getCourierFromShippingMethodName(methodName: string): string {
    // Default to JNE if we can't determine
    const defaultCourier = 'jne';

    const methodNameLower = methodName.toLowerCase();

    if (methodNameLower.includes('jne')) return 'jne';
    if (methodNameLower.includes('tiki')) return 'tiki';
    if (methodNameLower.includes('pos')) return 'pos';

    return defaultCourier;
  }

  // Calculate total weight of items in grams
  private async calculateTotalWeight(
    items: { productId: string; quantity: number }[],
  ): Promise<number> {
    // Default weight if product doesn't have one
    const DEFAULT_WEIGHT = 500; // 500 grams

    let totalWeight = 0;

    for (const item of items) {
      const product = await prismaclient.product.findUnique({
        where: { id: item.productId },
      });

      // Convert weight from kg to grams, or use default
      const productWeight = product?.weight
        ? product.weight * 1000
        : DEFAULT_WEIGHT;

      // Add to total
      totalWeight += productWeight * item.quantity;
    }

    // Minimum weight is 100 grams for most couriers
    return Math.max(totalWeight, 100);
  }

  private calculateDistanceBasedShipping(
    distance: number,
    baseShippingCost: number,
  ): number {
    // Fallback method when RajaOngkir fails
    const freeDistance = 5; // First 5km included in base cost
    const costPerKm = 0.5; // Additional cost per km

    if (distance <= freeDistance) {
      return baseShippingCost;
    }

    const additionalDistance = distance - freeDistance;
    const additionalCost = additionalDistance * costPerKm;

    // Round to 2 decimal places
    return Math.round((baseShippingCost + additionalCost) * 100) / 100;
  }

  private async findNearestStoreWithStock(
    userLat: number,
    userLng: number,
    items: { productId: string; quantity: number }[],
  ) {
    // Get all active stores
    const stores = await prismaclient.store.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        province: true,
        postalCode: true,
        latitude: true,
        longitude: true,
        maxDistance: true,
      },
    });

    if (!stores || stores.length === 0) {
      throw new BadRequestError('No active stores available');
    }

    // Calculate distances and check stock availability
    const storesWithDistance: Array<{
      store: any;
      distance: number;
      missingItems: Array<{ productId: string; name: string }>;
    }> = [];

    for (const store of stores) {
      // Skip stores without coordinates
      if (!store.latitude || !store.longitude) continue;

      // Calculate distance
      const distance = this.calculateDistance(
        userLat,
        userLng,
        store.latitude,
        store.longitude,
      );

      // Check if distance exceeds store's max delivery distance
      if (distance > store.maxDistance) continue;

      // Check stock availability for all items
      const missingItems: Array<{ productId: string; name: string }> = [];

      for (const item of items) {
        const inventory = await prismaclient.inventory.findFirst({
          where: {
            productId: item.productId,
            storeId: store.id,
            quantity: { gte: item.quantity },
          },
          include: {
            product: {
              select: { name: true },
            },
          },
        });

        if (!inventory) {
          const product = await prismaclient.product.findUnique({
            where: { id: item.productId },
            select: { name: true },
          });

          missingItems.push({
            productId: item.productId,
            name: product?.name || 'Unknown product',
          });
        }
      }

      storesWithDistance.push({
        store,
        distance,
        missingItems,
      });
    }

    // Sort by distance
    storesWithDistance.sort((a, b) => a.distance - b.distance);

    // Find the first store with all items in stock
    const storeWithStock = storesWithDistance.find(
      (store) => store.missingItems.length === 0,
    );

    if (storeWithStock) {
      return {
        store: storeWithStock.store,
        distance: storeWithStock.distance,
        hasAllItems: true,
        missingItems: [],
      };
    }

    // If no store has all items, return the nearest store with missing items info
    if (storesWithDistance.length > 0) {
      return {
        store: storesWithDistance[0].store,
        distance: storesWithDistance[0].distance,
        hasAllItems: false,
        missingItems: storesWithDistance[0].missingItems,
      };
    }

    throw new BadRequestError(
      'No stores available with any of the required items',
    );
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    // Earth's radius in kilometers
    const R = 6371;

    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers

    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
