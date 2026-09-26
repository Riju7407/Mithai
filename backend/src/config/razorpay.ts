import Razorpay from 'razorpay';
import crypto from 'crypto';
import { ENV } from './env';

export const razorpayInstance = new Razorpay({
  key_id: ENV.RAZORPAY_KEY_ID,
  key_secret: ENV.RAZORPAY_KEY_SECRET,
});

export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  try {
    const generatedSignature = crypto
      .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  } catch (error) {
    console.error('[Razorpay Signature Error]', error);
    return false;
  }
};

export const verifyWebhookSignature = (
  webhookBody: string,
  signature: string
): boolean => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', ENV.RAZORPAY_WEBHOOK_SECRET)
      .update(webhookBody)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('[Razorpay Webhook Error]', error);
    return false;
  }
};
