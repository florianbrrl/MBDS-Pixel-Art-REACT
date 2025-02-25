import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  env: string;
  port: number;
  apiPrefix: string;
  log: {
    level: string;
    filename: string;
  };
  cors: {
    origin: string;
  };
}

export const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || '/api',
  log: {
    level: process.env.LOG_LEVEL || 'info',
    filename: process.env.LOG_FILENAME || 'app.log',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};