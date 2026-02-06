// src/types.ts

export interface Order {
  _id: string;
  product_name: string;
  total_amount: number;
  status: { status: string }[];
  createdAt: string;
  quantity: string;
  customer_address_id: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
  };
  customer_name: string;
}

export interface TrackingStep {
  status: string;
  date: string;
  active: boolean;
}
