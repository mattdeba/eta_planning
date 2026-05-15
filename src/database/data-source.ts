import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from './typeorm.options';

const nodeEnv = process.env.NODE_ENV ?? 'development';

loadEnv({ path: `.env.${nodeEnv}` });
loadEnv();

const defaults: Record<string, string> = {
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: '5433',
  DATABASE_USER: 'eta',
  DATABASE_PASSWORD: 'eta',
  DATABASE_NAME: 'eta_planning',
  DATABASE_SSL: 'false',
  TYPEORM_LOGGING: 'false',
};

const envConfig = {
  get<T = unknown>(key: string, defaultValue?: T): T | undefined {
    const value = process.env[key] ?? defaults[key];
    return (value ?? defaultValue) as T | undefined;
  },
  getOrThrow<T = unknown>(key: string): T {
    const value = process.env[key] ?? defaults[key];

    if (value === undefined) {
      throw new Error(`Missing required environment variable ${key}`);
    }

    return value as T;
  },
};

export default new DataSource(buildDataSourceOptions(envConfig));
