export type RapidFindPlaceResponse = {
  address_components: AddressComponent[];
  formatted_address: string;
  geometry: Geometry;
  place_id: string;
  types: string[];
};

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: (
    | 'street_number'
    | 'route'
    | 'establishment'
    | 'point_of_interest'
    | 'subpremise'
    | 'administrative_area_level_1'
    | 'administrative_area_level_2'
    | 'administrative_area_level_3'
    | 'administrative_area_level_4'
    | 'administrative_area_level_5'
    | 'administrative_area_level_6'
    | 'administrative_area_level_7'
    | 'political'
    | 'country'
    | 'postal_code'
  )[];
};

type Geometry = {
  bounds: {
    northeast: LatLong;
    southwest: LatLong;
  };
  location: LatLong;
  location_type: 'ROOFTOP';
  viewport: {
    northeast: LatLong;
    southwest: LatLong;
  };
};

type LatLong = {
  lat: number;
  lng: number;
};
