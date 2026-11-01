import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSessionEntity } from '@/apis/auth/entities/user-session.entity';
import { RoleEntity } from '@/apis/roles/entities/role.entity';
import { UserEntity } from '@/apis/user/entities/user.entity';

import { UserSeedService } from './user-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity, UserSessionEntity])],
  providers: [UserSeedService],
  exports: [UserSeedService],
})
export class UserSeedModule {}
