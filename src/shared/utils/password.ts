import bcrypt from 'bcryptjs';
import { config } from '../../infrastructure/config';

/**
 * Hash a plain-text password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.bcrypt.saltRounds);
};

/**
 * Compare a plain-text password against a hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};