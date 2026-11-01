import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { ApiController, ApiCreate, ApiDelete, ApiGetAll, ApiGetOne, ApiUpdate } from '@/common/base/base.swagger';
import { CheckAbilities } from '@/module/ability/abilities.decorator';
import { AbilitiesGuard } from '@/module/ability/abilities.guard';

import { AuthStrategy } from '../../auth/auth.const';
import { PermissionEnum } from '../../permissions/permission.enum';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserByIdDto } from '../dto/update-user-by-id.dto';
import { UserEntity } from '../entities/user.entity';
import { IUserService } from '../interface/user.interface';
import { userPaginateConfig } from '../user.paginate';

@Controller({ path: 'user', version: '1' })
@ApiController('User')
@ApiBearerAuth('accessToken')
export class UserController {
  constructor(@Inject(IUserService) private readonly userService: IUserService) {}

  @Post()
  @ApiCreate(UserEntity, 'User')
  @UseGuards(AuthGuard(AuthStrategy.USER_JWT), AbilitiesGuard)
  @CheckAbilities({ action: PermissionEnum.CREATE, subject: UserEntity })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  @ApiGetAll(UserEntity, 'User', userPaginateConfig)
  @UseGuards(AuthGuard(AuthStrategy.USER_JWT), AbilitiesGuard)
  @CheckAbilities({ action: PermissionEnum.GET, subject: 'all' })
  getAll(@Paginate() query: PaginateQuery) {
    return this.userService.getAllUserPaginated(query);
  }

  @Get(':id')
  @ApiGetOne(UserEntity, 'User')
  @UseGuards(AuthGuard(AuthStrategy.USER_JWT), AbilitiesGuard)
  @CheckAbilities({ action: PermissionEnum.GET, subject: UserEntity })
  getOne(@Param('id') id: string) {
    return this.userService.getOneUserById(id);
  }

  @Patch(':id')
  @ApiUpdate(UserEntity, 'User')
  @UseGuards(AuthGuard(AuthStrategy.USER_JWT), AbilitiesGuard)
  @CheckAbilities({ action: PermissionEnum.UPDATE, subject: UserEntity })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserByIdDto) {
    return this.userService.updateUserById(id, updateUserDto);
  }

  @Delete(':id')
  @ApiDelete(UserEntity, 'User')
  @UseGuards(AuthGuard(AuthStrategy.USER_JWT), AbilitiesGuard)
  @CheckAbilities({ action: PermissionEnum.DELETE, subject: UserEntity })
  remove(@Param('id') id: string) {
    return this.userService.removeUserById(id);
  }
}
