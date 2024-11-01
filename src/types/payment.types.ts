// src/types/payment.types.ts
export interface CreatePaymentLinkDto {
    amount: number;
    currency?: string;
    metadata?: PaymentLinkMetadata;
  }
  
  export interface PaymentLinkMetadata {
    orderId?: string | null;
    customerEmail?: string | null;
    productName?: string | null;
    [key: string]: string | null | undefined;
  }
  
  export interface PaymentLinkResponse {
    id: string;
    url: string;
    amount: number;
    currency: string;
    metadata?: PaymentLinkMetadata;
    expiresAt: number | null;
  }
  
  export enum PaymentStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    PAID = 'paid',
    FAILED = 'failed',
    REFUNDED = 'refunded',
    CANCELLED = 'cancelled'
  }
  
  export interface PaymentDetails {
    paymentId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    paidAt: Date;
    status: PaymentStatus;
    metadata?: Record<string, any>;
  }
  
  export interface PaymentSession {
    sessionId: string;
    paymentIntentId: string;
    customerId: string;
    customerEmail?: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    metadata?: Record<string, any>;
    items?: PaymentSessionItem[];
    createdAt: Date;
  }
  
  export interface PaymentSessionItem {
    priceId: string;
    productId: string;
    quantity: number;
    amount: number;
    currency: string;
    name: string;
    description?: string;
  }