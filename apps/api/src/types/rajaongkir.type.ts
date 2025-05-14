export type RO_GetAllProvince = {
  rajaongkir: {
    results: {
      province_id: string;
      province: string;
    }[];
  };
};

export type RO_GetAllCity = {
  rajaongkir: {
    results: {
      city_id: string;
      province_id: string;
      province: string;
      type: string;
      city_name: string;
      postal_code: string;
    }[];
  };
};

export type RO_SearchDomestic = {
  meta: {
    message: string;
    code: number;
    status: string;
  };
  data: {
    id: number;
    label: string;
    province_name: string;
    city_name: string;
    district_name: string;
    subdistrict_name: string;
    zip_code: string;
  }[];
};

export type RO_ShippingCost = {
  meta: {
    message: string;
    code: number;
    status: string;
  };
  data: {
    name: string;
    code: string;
    service: string;
    description: string;
    cost: number;
    etd: string;
  }[];
};
