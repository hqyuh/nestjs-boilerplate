import { CookieOptions } from "express";

export interface DatabaseConfig {
  type: string
  host: string;
  port: number;
  name: string;
  username: string;
  password: string;
  schema: string;
}


export interface RedisConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  keyPrefix: string;
}

export interface JWTConfig {
  secret: string;
  expirationTime: number;
  refreshTime: number;
}

export interface AppConfig {
  port: number;
  environment: string;
  apiPrefix: string;
  jwt: JWTConfig;
  cookie: CookieOptions;
  database: DatabaseConfig;
  redis: RedisConfig;
}