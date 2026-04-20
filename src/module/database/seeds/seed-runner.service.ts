import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';

import { PermissionSeedService } from './permission/permission-seed.service';
import { RoleSeedService } from './role/role-seed.service';
import { UserSeedService } from './user/user-seed.service';

@Injectable()
export class SeedRunnerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedRunnerService.name);

  constructor(
    private readonly permissionSeedService: PermissionSeedService,
    private readonly roleSeedService: RoleSeedService,
    private readonly userSeedService: UserSeedService
  ) {}

  async onApplicationBootstrap() {
    // Only run seeds when explicitly enabled.
    // This prevents re-seeding on every hot-reload / watch restart (start:dev).
    const shouldRunSeeds = process.env.AUTO_SEED === 'true';

    if (!shouldRunSeeds) {
      this.logger.log('⏭️  Skipping auto-seed (set AUTO_SEED=true to enable)');
      return;
    }

    try {
      this.logger.log('🌱 Running database seeds...');

      await this.permissionSeedService.run();
      this.logger.log('✅ Permissions seeded');

      await this.roleSeedService.run();
      this.logger.log('✅ Roles seeded');

      await this.userSeedService.run();
      this.logger.log('✅ Users seeded');

      this.logger.log('🎉 All seeds completed successfully!');
    } catch (error) {
      this.logger.error('❌ Error running seeds:', error);
      // Don't throw to allow app to continue starting
    }
  }
}
