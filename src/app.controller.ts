import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthStrategy } from './apis/auth/auth.const';
import { PermissionEnum } from './apis/permissions/permission.enum';
import { UserEntity } from './apis/user/entities/user.entity';
import { AppService } from './app.service';
import { CheckAbilities } from './module/ability/abilities.decorator';
import { AbilitiesGuard } from './module/ability/abilities.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('rbac-admin')
  @ApiBearerAuth()
  @UseGuards(AuthGuard(AuthStrategy.USER_JWT), AbilitiesGuard)
  @CheckAbilities({ action: PermissionEnum.MANAGE, subject: UserEntity })
  createRBACAdmin(): string {
    // This is stuff for rbac create user entities (Admin has permission to create User)
    return 'The current user has permission to create UserEntity';
  }

  @Get('rbac-user')
  @ApiBearerAuth()
  @UseGuards(AuthGuard(AuthStrategy.USER_JWT), AbilitiesGuard)
  @CheckAbilities({ action: PermissionEnum.GET, subject: UserEntity })
  getRBACUser(): string {
    // This is stuff for rbac get user entities (User has permission to get User)
    return 'The current user has permission to get UserEntity';
  }
}
