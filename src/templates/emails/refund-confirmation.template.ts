// src/templates/emails/refund-confirmation.template.ts
import { baseTemplate } from './base.template';
import { CurrencyUtil } from '../../utils/currency.utils';

interface RefundConfirmationData {
  orderDetails: {
    orderId: string;
    amount: number;
    currency: string;
    refundDate: Date;
    refundReason?: string;
    originalAmount?: number;
    isPartialRefund?: boolean;
  };
}

export const refundConfirmationTemplate = (data: RefundConfirmationData) => {
  const { orderDetails } = data;
  const formattedRefundAmount = CurrencyUtil.formatAmount(orderDetails.amount, orderDetails.currency);
  const formattedOriginalAmount = orderDetails.originalAmount 
    ? CurrencyUtil.formatAmount(orderDetails.originalAmount, orderDetails.currency)
    : null;

  const content = `
    <div class="header">
        <h2>Refund Processed</h2>
    </div>
    <div class="content">
        <p>Your refund has been successfully processed.</p>
        
        <div class="details">
            <h3>Refund Details</h3>
            <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
            <p><strong>Refund Amount:</strong> ${formattedRefundAmount}</p>
            ${formattedOriginalAmount ? `
                <p><strong>Original Order Amount:</strong> ${formattedOriginalAmount}</p>
            ` : ''}
            ${orderDetails.isPartialRefund ? `
                <p><em>This is a partial refund of your original order.</em></p>
            ` : ''}
            <p><strong>Date Processed:</strong> ${orderDetails.refundDate.toLocaleDateString()}</p>
            ${orderDetails.refundReason ? `
                <p><strong>Reason:</strong> ${orderDetails.refundReason}</p>
            ` : ''}
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0;">
                <strong>Important Information:</strong>
            </p>
            <ul style="margin-top: 10px;">
                <li>The refunded amount will be credited to your original payment method.</li>
                <li>Please allow 5-10 business days for the refund to appear in your account.</li>
                <li>The processing time may vary depending on your bank or card issuer.</li>
            </ul>
        </div>
        
        <div style="margin-top: 20px;">
            <p>If you have any questions about this refund, please contact our support team.</p>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
            <a href="/support" 
               class="button" 
               style="background-color: #17a2b8;">
                Contact Support
            </a>
        </div>
    </div>
  `;

  return {
    subject: `Refund Processed - Order #${orderDetails.orderId}`,
    html: baseTemplate(content)
  };
};