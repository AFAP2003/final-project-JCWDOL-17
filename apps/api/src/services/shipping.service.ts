import { RAJA_ONGKIR_V2_API } from '@/config';
import { ShippingCostDTO } from '@/dtos/shipping-cost.dto';
import { ShippingSearchDomesticDTO } from '@/dtos/shipping-search-domestic.dto';
import { BadRequestError } from '@/errors';
import { RO_SearchDomestic, RO_ShippingCost } from '@/types/rajaongkir.type';
import axios from 'axios';
import qs from 'query-string';
import { z } from 'zod';

export class ShippingService {
  searchDomestic = async (dto: z.infer<typeof ShippingSearchDomesticDTO>) => {
    const baseurl = `https://rajaongkir.komerce.id/api/v1/destination/domestic-destination`;
    const queryobj = {
      search: dto.search,
      limit: dto.pageSize,
      offset: dto.page - 1,
    };
    const query = qs.stringify(queryobj);
    const { data } = await axios.get<RO_SearchDomestic>(`${baseurl}?${query}`, {
      headers: {
        key: RAJA_ONGKIR_V2_API,
      },
    });
    return data;
  };

  shippingCost = async (dto: z.infer<typeof ShippingCostDTO>) => {
    const originPostalCode = await (async () => {
      if (dto.origin.type === 'postal_code') return dto.origin.id;
      const domestic = await this.searchDomestic({
        page: 1,
        pageSize: 1,
        search: dto.origin.id,
      });
      if (!domestic.data.length) {
        throw new BadRequestError('Unreachable origin district');
      }

      return domestic.data[0].zip_code;
    })();

    const destinationPostalCode = await (async () => {
      if (dto.destination.type === 'postal_code') return dto.destination.id;
      const domestic = await this.searchDomestic({
        page: 1,
        pageSize: 1,
        search: dto.destination.id,
      });
      if (!domestic.data.length) {
        throw new BadRequestError('Unreachable destination district');
      }

      return domestic.data[0].zip_code;
    })();

    const baseurl = `https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost`;
    const payload = {
      origin: `${originPostalCode}`,
      destination: `${destinationPostalCode}`,
      weight: dto.weight,
      courier: dto.courier,
    };

    const { data } = await axios.post<RO_ShippingCost>(`${baseurl}`, payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        key: RAJA_ONGKIR_V2_API,
      },
    });

    return data;
  };
}
