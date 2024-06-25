import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();
// export const schema = configService.get<string>('DB_SCHEMA');

export const getEnv = () => process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
