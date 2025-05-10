export type LocationType = {
  label: string;
  address: string;
  city?: string;
  province?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  recipient?: string;
  phone?: string;
} | null;
