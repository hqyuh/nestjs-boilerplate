import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

export const AppDataSource = new DataSource({
	type: process.env.DB_TYPE,
	url: process.env.DATABASE_URL,
	host: process.env.DB_HOST,
	port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
	username: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	synchronize: false,
	dropSchema: false,
	keepConnectionAlive: true,
	logging: process.env.NODE_ENV !== 'production',
	entities: [__dirname + '/../**/*.entity{.ts,.js}'],
	migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
	cli: {
		entitiesDir: 'src/apis',
		migrationsDir: 'src/module/database/migrations',
		subscribersDir: 'subscriber'
	}
} as DataSourceOptions);
