import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

export interface IJwtPayload {
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export const generateToken = (payload: IJwtPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  });
};

export const verifyToken = (token: string): IJwtPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as IJwtPayload;
};
