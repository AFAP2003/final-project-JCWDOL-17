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
