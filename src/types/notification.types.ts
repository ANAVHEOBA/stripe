// src/types/notification.types.ts
export enum NotificationType {
    PAYMENT_SUCCESS = 'payment_success',
    PAYMENT_FAILED = 'payment_failed',
    PAYMENT_REFUNDED = 'payment_refunded',
    ORDER_CREATED = 'order_created',
    ORDER_UPDATED = 'order_updated',
    ORDER_CANCELLED = 'order_cancelled'
  }
  
  export interface NotificationData {
    type: NotificationType;
    data: Record<string, any>;
    timestamp: Date;
  }
  
  export interface EmailNotification {
    to: string;
    subject: string;
    template: string;
    data: Record<string, any>;
  }
  
  export interface DiscordNotification {
    title: string;
    description?: string;
    color?: number;
    fields: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    timestamp?: Date;
  }
  
  export interface SlackNotification {
    text: string;
    blocks: Array<{
      type: string;
      text: {
        type: string;
        text: string;
      };
    }>;
  }