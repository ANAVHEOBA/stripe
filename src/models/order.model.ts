// src/models/order.model.ts
import mongoose, { Document, Model, Schema } from 'mongoose';
import { PaymentStatus } from '../types/payment.types';

// Define the OrderItem interface
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface IOrder {
  orderId: string;
  customerId?: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  items: OrderItem[];
  paymentDetails?: {
    paymentId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    paidAt: Date;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderDocument extends IOrder, Document {
  calculateTotal(): number;
  totalAmount: number;
}

interface IOrderModel extends Model<IOrderDocument> {
  findByPaymentId(paymentId: string): Promise<IOrderDocument | null>;
  findByCustomer(customerId: string): Promise<IOrderDocument[]>;
}

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: String,
      index: true,
    },
    customerEmail: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: 'USD',
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      required: true,
      index: true,
    },
    items: [{
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
    }],
    paymentDetails: {
      paymentId: String,
      amount: Number,
      currency: String,
      paymentMethod: String,
      paidAt: Date,
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Methods
OrderSchema.methods.calculateTotal = function(this: IOrderDocument): number {
  return this.items.reduce((total: number, item: OrderItem) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Virtual for total amount
OrderSchema.virtual('totalAmount').get(function(this: IOrderDocument): number {
  return this.calculateTotal();
});

// Pre-save middleware
OrderSchema.pre('save', function(this: IOrderDocument, next: Function) {
  if (this.isNew) {
    const calculatedTotal = this.calculateTotal();
    if (calculatedTotal !== this.amount) {
      next(new Error(`Order amount (${this.amount}) does not match calculated total (${calculatedTotal})`));
      return;
    }
  }
  next();
});

// Static methods
OrderSchema.statics.findByPaymentId = function(paymentId: string): Promise<IOrderDocument | null> {
  return this.findOne({ 'paymentDetails.paymentId': paymentId });
};

OrderSchema.statics.findByCustomer = function(customerId: string): Promise<IOrderDocument[]> {
  return this.find({ customerId });
};

// Create indexes
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ updatedAt: -1 });
OrderSchema.index({ 'paymentDetails.paymentId': 1 }, { sparse: true });

export const Order = mongoose.model<IOrderDocument, IOrderModel>('Order', OrderSchema);