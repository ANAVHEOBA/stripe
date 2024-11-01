// src/services/notification.service.ts
import { WebhookClient, APIEmbed } from 'discord.js';
import { env } from '../config';
import { Logger } from '../utils/logger.utils';
import { CustomError } from '../utils/error.utils';
import { sendSlackNotification } from '../utils/slack.utils';
import { EmailService } from './email.service';
import { NotificationType } from '../types/notification.types';

export class NotificationService {
  private static discordWebhook = env.DISCORD_WEBHOOK_URL 
    ? new WebhookClient({ url: env.DISCORD_WEBHOOK_URL })
    : null;

  static async notifyPaymentSuccess({
    orderId,
    amount,
    currency,
    customerEmail,
    paymentDate,
  }: {
    orderId: string;
    amount: number;
    currency: string;
    customerEmail: string;
    paymentDate: Date;
  }): Promise<void> {
    try {
      const notificationPromises = [];

      // Send Discord notification if configured
      if (this.discordWebhook) {
        notificationPromises.push(
          this.sendDiscordNotification({
            type: NotificationType.PAYMENT_SUCCESS,
            data: { orderId, amount, currency, customerEmail, paymentDate },
          })
        );
      }

      // Send Slack notification if configured
      if (env.SLACK_WEBHOOK_URL) {
        notificationPromises.push(
          this.sendSlackNotification({
            type: NotificationType.PAYMENT_SUCCESS,
            data: { orderId, amount, currency, customerEmail, paymentDate },
          })
        );
      }

      // Send admin email if configured
      if (env.ADMIN_EMAIL) {
        notificationPromises.push(
          this.sendAdminNotification({
            type: NotificationType.PAYMENT_SUCCESS,
            data: { orderId, amount, currency, customerEmail, paymentDate },
          })
        );
      }

      await Promise.all(notificationPromises);
      Logger.info(`Success notifications sent for order ${orderId}`);
    } catch (error) {
      Logger.error('Error sending notifications:', error);
      throw new CustomError('Failed to send notifications', 500);
    }
  }

  private static async sendDiscordNotification({
    type,
    data,
  }: {
    type: NotificationType;
    data: any;
  }): Promise<void> {
    try {
      if (!this.discordWebhook) return;
      
      const embed = this.createDiscordEmbed(type, data);
      await this.discordWebhook.send({ embeds: [embed] });
    } catch (error) {
      Logger.error('Error sending Discord notification:', error);
    }
  }

  private static async sendSlackNotification({
    type,
    data,
  }: {
    type: NotificationType;
    data: any;
  }): Promise<void> {
    try {
      const message = this.createSlackMessage(type, data);
      await sendSlackNotification(message);
    } catch (error) {
      Logger.error('Error sending Slack notification:', error);
    }
  }

  private static async sendAdminNotification({
    type,
    data,
  }: {
    type: NotificationType;
    data: any;
  }): Promise<void> {
    try {
      if (!env.ADMIN_EMAIL) return;

      await EmailService.sendPaymentConfirmation({
        to: env.ADMIN_EMAIL,
        orderDetails: {
          orderId: data.orderId,
          amount: data.amount,
          currency: data.currency,
          items: [],
          paymentDate: data.paymentDate,
        },
      });
    } catch (error) {
      Logger.error('Error sending admin notification:', error);
    }
  }

  private static createDiscordEmbed(type: NotificationType, data: any): APIEmbed {
    return {
      title: 'Payment Successful',
      color: 0x00ff00,
      fields: [
        { name: 'Order ID', value: data.orderId, inline: true },
        { name: 'Amount', value: `${data.amount / 100} ${data.currency.toUpperCase()}`, inline: true },
        { name: 'Customer', value: data.customerEmail, inline: true },
        { name: 'Date', value: data.paymentDate.toISOString(), inline: true },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  private static createSlackMessage(type: NotificationType, data: any) {
    return {
      text: 'New Payment Received! 🎉',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Order ID:* ${data.orderId}\n*Amount:* ${data.amount / 100} ${data.currency.toUpperCase()}\n*Customer:* ${data.customerEmail}\n*Date:* ${data.paymentDate.toISOString()}`,
          },
        },
      ],
    };
  }
}