export type ShippingCostResponse = {
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
