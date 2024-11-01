// src/models/payment.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  sessionId: string;
  paymentIntentId: string;
  customerId: string;
  customerEmail?: string;
  amount: number;
  currency: string;
  status: string;
  metadata?: Record<string, any>;
  items?: any[];
  createdAt: Date;
}

const PaymentSchema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  paymentIntentId: { type: String, required: true },
  customerId: { type: String, required: true },
  customerEmail: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  items: [Schema.Types.Mixed],
  createdAt: { type: Date, default: Date.now }
});

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);