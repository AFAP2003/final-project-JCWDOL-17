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
  types: string[];
};

type Geometry = {
  bounds: {
    northeast: LatLong;
    southwest: LatLong;
  };
  location: LatLong;
  location_type: string;
  viewport: {
    northeast: LatLong;
    southwest: LatLong;
  };
};

type LatLong = {
  lat: number;
  lng: number;
};
