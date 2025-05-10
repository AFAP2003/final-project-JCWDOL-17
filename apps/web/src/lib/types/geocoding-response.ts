export type GeocodingResponse = {
  address: string;
  name?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
}[];
