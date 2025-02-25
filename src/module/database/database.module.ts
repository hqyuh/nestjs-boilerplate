import { Permission } from '@/apis/permissions/entities/permission.entity';
import { Role } from '@/apis/roles/entities/role.entity';
import { UserEntity } from '@/apis/user/entities/user.entity';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        schema: configService.getOrThrow<string>('DB_SCHEMA'),
        autoLoadEntities: true,
        migrationsTableName: `migrations`,
        entities: [__dirname + '/../**/*.entity{.ts,.js}', UserEntity, Role, Permission],
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        migrationsRun: true,
        synchronize: false,
        cli: {
          entitiesDir: 'src',
          migrationsDir: 'src/database/migrations',
          subscribersDir: 'subscriber',
        },
      }),
      dataSourceFactory: async (options) => {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return addTransactionalDataSource(new DataSource(options));
      },
    }),
  ],
})
export class DatabaseModule {}
