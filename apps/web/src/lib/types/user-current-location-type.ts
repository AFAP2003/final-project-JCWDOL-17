export type UserCurrentLocationType = GeolocationSource | AddressSource | null;

type GeolocationSource = {
  location: {
    label: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  source: 'geolocation';
};

type AddressSource = {
  location: {
    label: string;
    address: string;
    latitude: number;
    longitude: number;
    addressDetail: {
      city: string;
      province: string;
      postalCode: string;
    };
    recipientDetail: {
      recipient: string;
      phone: string;
    };
  };
  source: 'address';
};
