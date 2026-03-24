import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '../configs/config.module';
import { DatabaseConfig } from '../configs/interfaces/config.interface';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseConfig = configService.getOrThrow<DatabaseConfig>('app.database');

        return {
          type: 'postgres',
          host: databaseConfig.host,
          port: databaseConfig.port,
          username: databaseConfig.username,
          password: databaseConfig.password,
          database: databaseConfig.name,
          schema: databaseConfig.schema,
          autoLoadEntities: true,
          migrationsTableName: `migrations`,
          entities: [join(__dirname, '../../**/*.entity{.ts,.js}')],
          migrations: [join(__dirname, 'migrations/**/*{.ts,.js}')],
          migrationsRun: true,
          synchronize: false,
          cli: {
            entitiesDir: 'src',
            migrationsDir: 'src/database/migrations',
            subscribersDir: 'subscriber',
          },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
