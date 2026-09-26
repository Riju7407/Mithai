import crypto from 'crypto';

export const generateOrderNumber = (): string => {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${year}-${randomHex}`;
};

export const generateBookingNumber = (): string => {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `EVT-${year}-${randomHex}`;
};

export const generatePaymentNumber = (): string => {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PAY-${year}-${randomHex}`;
};
