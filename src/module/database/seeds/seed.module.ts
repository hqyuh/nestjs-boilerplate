import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '../database.module';
import { PermissionSeedModule } from './permission/permission-seed.module';
import { RoleSeedModule } from './role/role-seed.module';
import { SeedRunnerService } from './seed-runner.service';
import { UserSeedModule } from './user/user-seed.module';

@Module({
  imports: [
    // Core seeds (no dependencies)
    PermissionSeedModule,
    RoleSeedModule,
    UserSeedModule,
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    DatabaseModule,
  ],
  providers: [SeedRunnerService],
})
export class SeedModule {}
