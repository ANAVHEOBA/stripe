// src/services/email.service.ts
import nodemailer from 'nodemailer';
import { env } from '../config';
import { Logger } from '../utils/logger.utils';
import { CustomError } from '../utils/error.utils';
import { EmailTemplates } from '../templates/email.templates';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  static async sendPaymentConfirmation({
    to,
    orderDetails,
  }: {
    to: string;
    orderDetails: {
      orderId: string;
      amount: number;
      currency: string;
      items: any[];
      paymentDate: Date;
    };
  }): Promise<void> {
    try {
      const { subject, html } = EmailTemplates.paymentSuccess({
        orderDetails
      });

      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
      });

      Logger.info(`Payment confirmation email sent to ${to}`);
    } catch (error) {
      Logger.error('Error sending payment confirmation email:', error);
      throw new CustomError('Failed to send payment confirmation email', 500);
    }
  }

  static async sendPaymentFailedNotification({
    to,
    orderDetails,
  }: {
    to: string;
    orderDetails: {
      orderId: string;
      amount: number;
      currency: string;
      failureReason?: string;
    };
  }): Promise<void> {
    try {
      const { subject, html } = EmailTemplates.paymentFailed({
        orderDetails
      });

      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
      });

      Logger.info(`Payment failed notification sent to ${to}`);
    } catch (error) {
      Logger.error('Error sending payment failed notification:', error);
      throw new CustomError('Failed to send payment failed notification', 500);
    }
  }

  static async sendRefundConfirmation({
    to,
    orderDetails,
  }: {
    to: string;
    orderDetails: {
      orderId: string;
      amount: number;
      currency: string;
      refundDate: Date;
      refundReason?: string;
    };
  }): Promise<void> {
    try {
      const { subject, html } = EmailTemplates.refundConfirmation({
        orderDetails
      });

      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
      });

      Logger.info(`Refund confirmation sent to ${to}`);
    } catch (error) {
      Logger.error('Error sending refund confirmation:', error);
      throw new CustomError('Failed to send refund confirmation', 500);
    }
  }
}