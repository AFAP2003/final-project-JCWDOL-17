import { RAJA_ONGKIR_STARTER_API, RAPID_API_KEY } from '@/config';
import { CityGetAllDTO } from '@/dtos/city-get-all.dto';
import { GeocodingDTO } from '@/dtos/geocoding.dto';
import { ProvinceGetAllDTO } from '@/dtos/province-get-all.dto';
import { BadRequestError, NotFoundError } from '@/errors';
import {
  calculateMetadataPagination,
  calculateOffsite,
} from '@/helpers/pagination';
import { redisOM } from '@/redis';
import { RO_GetAllCity, RO_GetAllProvince } from '@/types/rajaongkir.type';
import { RapidFindPlaceResponse } from '@/types/rapid-api.types';
import axios from 'axios';
import qs from 'query-string';
import { z } from 'zod';

let isInitialize = false;
let isChecking = false;

export class LocationService {
  geocoding = async (dto: z.infer<typeof GeocodingDTO>) => {
    if (!dto.name && !dto.lat && !dto.lng) return [];

    // const baseurl =
    // 'https://google-map-places.p.rapidapi.com/maps/api/geocode/json';

    const baseurl = 'https://maps.googleapis.com/maps/api/geocode/json';

    const param = {
      address: dto.name || '',
      latlng: dto.lat && dto.lng ? `${dto.lat}, ${dto.lng}` : '',
      language: 'id',
      region: 'id',
      // result_type: 'street_address',
      // location_type: 'ROOFTOP',
      key: RAPID_API_KEY,
    };

    const query = qs.stringify(param, {
      skipEmptyString: true,
      skipNull: true,
    });

    // const { data } = await axios.get(`${baseurl}?${query}`, {
    //   headers: {
    //     'x-rapidapi-host': 'google-map-places.p.rapidapi.com',
    //     'x-rapidapi-key': RAPID_API_KEY,
    //   },
    // });
    const { data } = await axios.get(`${baseurl}?${query}`);

    const results = data.results as RapidFindPlaceResponse[];

    const formatted = results.map((place) => {
      let name = place.address_components.find((ac) =>
        ac.types.includes('point_of_interest'),
      )?.long_name;
      if (!name) {
        name = place.address_components.find((ac) =>
          ac.types.includes('establishment'),
        )?.long_name;
      }
      if (!name) {
        name = place.address_components.find((ac) =>
          ac.types.includes('route'),
        )?.long_name;
      }
      if (!name) {
        name = place.address_components.at(0)?.long_name;
      }

      let province = place.address_components.find((ac) =>
        ac.types.includes('administrative_area_level_1'),
      )?.long_name;

      let city = place.address_components.find((ac) =>
        ac.types.includes('administrative_area_level_2'),
      )?.long_name;

      let postalCode = place.address_components.find((ac) =>
        ac.types.includes('postal_code'),
      )?.long_name;

      return {
        address: place.formatted_address,
        name: name || null,
        city: city || null,
        province: province || null,
        postalCode: postalCode || null,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      };
    });

    return formatted.slice(0, dto.resultSize);
  };

  provinceGetAll = async (dto: z.infer<typeof ProvinceGetAllDTO>) => {
    if (isChecking) {
      throw new BadRequestError('Request conflict, try again later');
    }

    const redis = await this.redisclient();

    let search = redis.repo.province.search();

    if (dto.name) {
      const query = this.escapeQuery(dto.name);
      search = search.where('provinceName').matches(query);
    }
    const offsite = calculateOffsite({
      page: dto.page,
      pageSize: dto.pageSize,
    });

    const count = await search.return.count();
    const provinces = await search.return.page(offsite, dto.pageSize);

    const metadata = calculateMetadataPagination({
      page: dto.page,
      pageSize: dto.pageSize,
      totalRecord: count,
    });

    return { provinces, metadata };
  };

  provinceGetByName = async (name: string) => {
    if (isChecking) {
      throw new BadRequestError('Request conflict, try again later');
    }

    const redis = await this.redisclient();

    const province = await redis.repo.province
      .search()
      .where('provinceName')
      .matchExactly(name)
      .return.first();

    if (!province) throw new NotFoundError();

    return province as {
      provinceId: string;
      provinceName: string;
      [key: symbol]: string;
    };
  };

  cityGetAll = async (dto: z.infer<typeof CityGetAllDTO>) => {
    if (isChecking) {
      throw new BadRequestError('Request conflict, try again later');
    }

    const redis = await this.redisclient();

    let search = redis.repo.city.search();

    if (dto.name) {
      const query = this.escapeQuery(dto.name);
      search = search.where('cityName').matches(query);
    }
    const offsite = calculateOffsite({
      page: dto.page,
      pageSize: dto.pageSize,
    });

    const count = await search.return.count();
    const cities = await search.return.page(offsite, dto.pageSize);

    const metadata = calculateMetadataPagination({
      page: dto.page,
      pageSize: dto.pageSize,
      totalRecord: count,
    });

    return { cities, metadata };
  };

  cityGetByName = async (name: string) => {
    if (isChecking) {
      throw new BadRequestError('Request conflict, try again later');
    }

    const redis = await this.redisclient();

    const city = await redis.repo.city
      .search()
      .where('cityName')
      .matchExactly(name)
      .return.first();

    if (!city) throw new NotFoundError();

    return city as {
      cityId: string;
      cityName: string;
      postalCode: string;
      provinceId: string;
      provinceName: string;
      [key: symbol]: string;
    };
  };

  private escapeQuery = (value: string) => {
    return value
      .trim()
      .replace(/([\\\-@{}[\]|&><~=!()"'?])/g, '\\$1') // escape special chars (tapi biarkan `*`)
      .split(/\s+/) // pecah jadi kata-kata
      .map((word) => `${word}*`) // tambahkan wildcard
      .join(' ');
  };

  private redisclient = async () => {
    const redis = await redisOM();
    if (isInitialize) return redis;

    isChecking = true;
    try {
      if (
        (await redis.repo.province.search().return.count()) > 0 &&
        (await redis.repo.city.search().return.count()) > 0
      ) {
        isChecking = false;
        isInitialize = true;
        return redis;
      }

      const { data: fetchprovinces } = await axios.get<RO_GetAllProvince>(
        'https://api.rajaongkir.com/starter/province',
        {
          headers: { key: RAJA_ONGKIR_STARTER_API },
        },
      );
      const provinces = fetchprovinces.rajaongkir.results;
      await Promise.all(
        provinces.map(async (province) => {
          return await redis.repo.province.save({
            provinceId: province.province_id,
            provinceName: province.province,
          });
        }),
      );

      const { data: fetchcities } = await axios.get<RO_GetAllCity>(
        'https://api.rajaongkir.com/starter/city',
        {
          headers: { key: RAJA_ONGKIR_STARTER_API },
        },
      );
      const cities = fetchcities.rajaongkir.results;
      await Promise.all(
        cities.map(async (city) => {
          return await redis.repo.city.save({
            cityId: city.city_id,
            cityName: `${city.type} ${city.city_name}`,
            provinceId: city.province_id,
            provinceName: city.province_id,
            postalCode: city.postal_code,
          });
        }),
      );

      isChecking = false;
      isInitialize = true;
      return redis;
    } catch (error) {
      throw new Error(`failed to cache raja ongkir region response ${error}`);
    }
  };
}
