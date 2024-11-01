// src/templates/emails/payment-failed.template.ts
import { baseTemplate } from './base.template';
import { CurrencyUtil } from '../../utils/currency.utils';

interface PaymentFailedData {
  orderDetails: {
    orderId: string;
    amount: number;
    currency: string;
    failureReason?: string;
  };
}

export const paymentFailedTemplate = (data: PaymentFailedData) => {
  const { orderDetails } = data;
  const formattedAmount = CurrencyUtil.formatAmount(orderDetails.amount, orderDetails.currency);

  const content = `
    <div class="header" style="background-color: #fff3f3;">
        <h2>Payment Failed</h2>
    </div>
    <div class="content">
        <p>We were unable to process your payment for the following order:</p>
        
        <div class="details">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
            <p><strong>Amount:</strong> ${formattedAmount}</p>
            ${orderDetails.failureReason ? `
                <p><strong>Reason:</strong> ${orderDetails.failureReason}</p>
            ` : ''}
        </div>
        
        <p>Please try again or contact our support team if you need assistance.</p>
        <a href="/retry-payment/${orderDetails.orderId}" class="button">Retry Payment</a>
    </div>
  `;

  return {
    subject: `Payment Failed - Order #${orderDetails.orderId}`,
    html: baseTemplate(content)
  };
};