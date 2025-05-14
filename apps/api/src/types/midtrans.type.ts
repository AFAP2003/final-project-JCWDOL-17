export interface MidtransItem {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface MidtransCustomer {
  first_name: string;
  email: string;
  phone?: string;
}

export interface MidtransTransactionDetails {
  order_id: string;
  gross_amount: number;
}

export interface MidtransPaymentRequest {
  transaction_details: MidtransTransactionDetails;
  credit_card?: {
    secure: boolean;
  };
  item_details: MidtransItem[];
  customer_details: MidtransCustomer;
  expiry?: {
    start_time: string;
    unit: string;
    duration: number;
  };
  callbacks?: {
    finish: string;
    error?: string;
    pending?: string;
  };
}
