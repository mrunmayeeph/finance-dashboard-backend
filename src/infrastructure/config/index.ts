import dotenv from 'dotenv';
dotenv.config();

/**
 * Application Configuration
 * Centralized configuration management with environment variables
 */
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-db',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
} as const;

/**
 * Validate required environment variables
 */
export const validateConfig = (): void => {
  const requiredVars = ['JWT_SECRET', 'MONGODB_URI'];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0 && config.env === 'production') {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};