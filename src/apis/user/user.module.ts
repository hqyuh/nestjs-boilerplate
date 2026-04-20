import { RoleEntity } from '@/apis/roles/entities/role.entity';
import { AbilityModule } from '@/module/ability/ability.module';
import { CacheModule } from '@/module/cache/cache.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';
import { IUserService } from './interface/user.interface';
import { UserController as UserControllerV1 } from './v1/user.controller';
import { UserService as UserServiceV1 } from './v1/user.service';
import { UserController as UserControllerV2 } from './v2/user.controller';
import { UserService as UserServiceV2 } from './v2/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity]), CacheModule, AbilityModule],
  controllers: [UserControllerV1, UserControllerV2],
  providers: [
    {
      provide: IUserService,
      useClass: UserServiceV1,
    },
    {
      provide: IUserService,
      useClass: UserServiceV2,
    },
  ],
  exports: [IUserService],
})
export class UserModule {}
