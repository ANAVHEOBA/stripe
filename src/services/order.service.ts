// src/services/order.service.ts
import { Order, IOrderDocument } from '../models/order.model';
import { Logger } from '../utils/logger.utils';
import { CustomError } from '../utils/error.utils';
import { PaymentStatus } from '../types/payment.types';

export class OrderService {
  static async updateOrderStatus({
    orderId,
    status,
    paymentDetails,
  }: {
    orderId: string;
    status: PaymentStatus;
    paymentDetails: {
      paymentId: string;
      amount: number;
      currency: string;
      paymentMethod: string;
      paidAt: Date;
    };
  }): Promise<IOrderDocument> {
    try {
      const order = await Order.findOne({ orderId });

      if (!order) {
        throw new CustomError(`Order not found: ${orderId}`, 404);
      }

      order.status = status;
      order.paymentDetails = paymentDetails;
      
      await order.save();

      Logger.info(`Order ${orderId} status updated to ${status}`);
      return order;
    } catch (error) {
      Logger.error('Error updating order status:', error);
      throw error instanceof CustomError ? error : new CustomError('Failed to update order status', 500);
    }
  }

  static async getOrder(orderId: string): Promise<IOrderDocument> {
    try {
      const order = await Order.findOne({ orderId });

      if (!order) {
        throw new CustomError(`Order not found: ${orderId}`, 404);
      }

      return order;
    } catch (error) {
      Logger.error('Error retrieving order:', error);
      throw error instanceof CustomError ? error : new CustomError('Failed to retrieve order', 500);
    }
  }

  static async getOrderByPaymentId(paymentId: string): Promise<IOrderDocument | null> {
    try {
      return await Order.findByPaymentId(paymentId);
    } catch (error) {
      Logger.error('Error retrieving order by payment ID:', error);
      throw new CustomError('Failed to retrieve order', 500);
    }
  }

  static async getCustomerOrders(customerId: string): Promise<IOrderDocument[]> {
    try {
      return await Order.findByCustomer(customerId);
    } catch (error) {
      Logger.error('Error retrieving customer orders:', error);
      throw new CustomError('Failed to retrieve customer orders', 500);
    }
  }
}