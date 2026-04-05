import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../../infrastructure/config';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

/**
 * Generate an access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, config.jwt.secret, options);
};

/**
 * Verify an access token
 */
export const verifyAccessToken = (token: string): DecodedToken | null => {
  try {
    return jwt.verify(token, config.jwt.secret) as DecodedToken;
  } catch (error) {
    return null; // Return null on verification failure instead of throwing
  }
};