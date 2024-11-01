// src/types/order.types.ts
import { PaymentDetails, PaymentStatus } from './payment.types';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  metadata?: Record<string, any>;
}

export interface OrderAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  customerId?: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: PaymentStatus;
  paymentDetails?: PaymentDetails;
  billingAddress?: OrderAddress;
  shippingAddress?: OrderAddress;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}