import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { UserSeedService } from './user/user-seed.service';
import { RoleSeedService } from './role/role-seed.service';
import { PermissionSeedService } from './permission/permission-seed.service';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  await app.get(PermissionSeedService).run();
  await app.get(RoleSeedService).run();
  await app.get(UserSeedService).run();

  await app.close();
};

void runSeed();
