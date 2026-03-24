import { registerAs } from '@nestjs/config';
import { plainToClass, Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Staging = 'staging',
}

class EnvironmentVariables {
  // Environment Configuration
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  PORT: number = 3000;

  @IsString()
  API_PREFIX: string = 'api/v1';

  // Database Configuration
  @IsString()
  DB_TYPE: string;

  @IsString()
  DB_HOST: string = 'localhost';

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  DB_PORT: number = 5432;

  @IsString()
  DB_NAME: string;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_SCHEMA: string;

  // JWT Configuration
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  JWT_EXPIRATION_TIME: number = 60 * 15; // 15 minutes

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  JWT_REFRESH_TOKEN_TIME: number = 60 * 60 * 24 * 7; // 7 days

  @IsString()
  JWT_SECRET: string;

  // Cookie Configuration
  @IsString()
  SAME_SITE: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  MAX_AGE: number;

  // Redis Configuration
  @IsString()
  REDIS_HOST: string = 'localhost';

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  REDIS_PORT: number = 6379;

  @IsString()
  REDIS_USERNAME: string;

  @IsString()
  REDIS_PASSWORD: string;

  @IsString()
  REDIS_PREFIX: string = 'peek-rate:';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
    excludeExtraneousValues: false,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.toString()}`);
  }

  return config;
}

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  jwt: {
    secret: process.env.JWT_SECRET,
    expirationTime: parseInt(process.env.JWT_EXPIRATION_TIME, 10),
    refreshTime: parseInt(process.env.JWT_REFRESH_TOKEN_TIME, 10),
  },

  cookie: {
    sameSite: process.env.SAME_SITE,
    maxAge: parseInt(process.env.MAX_AGE, 10),
  },

  database: {
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    schema: process.env.DB_SCHEMA,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    keyPrefix: process.env.REDIS_PREFIX,
  },
}));

export { Environment };
