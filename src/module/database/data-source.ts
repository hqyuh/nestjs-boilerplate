import 'reflect-metadata';

import { resolve } from 'path';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

// Load environment variables from root .env file
// When running from TypeScript, __dirname is the source directory
// When running from compiled JS, __dirname is the dist directory
const envPath =
  process.env.NODE_ENV === 'production' ? resolve(__dirname, '../../.env.production') : resolve(process.cwd(), '.env');

config({ path: envPath });

export const AppDataSource = new DataSource({
  type: (process.env.DB_TYPE as 'postgres') || 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema: process.env.DB_SCHEMA || 'public',
  synchronize: false,
  dropSchema: false,
  keepConnectionAlive: true,
  logging: process.env.NODE_ENV !== 'production',
  entities: [resolve(__dirname, '../../**/*.entity{.ts,.js}')],
  migrations: [resolve(__dirname, './migrations/**/*{.ts,.js}')],
  cli: {
    entitiesDir: resolve(__dirname, '../../apis'),
    migrationsDir: resolve(__dirname, './migrations'),
    subscribersDir: resolve(__dirname, './subscribers'),
  },
} as DataSourceOptions);
