import { PaginationDto } from '@/common/base/base.dto';
import {
	ApiController,
	ApiCreate,
	ApiDelete,
	ApiGetAll,
	ApiGetOne,
	ApiUpdate
} from '@/common/base/base.swagger';

import { CheckAbilities } from '@/module/ability/abilities.decorator';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PermissionEnum } from '../permissions/permission.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserByIdDto } from './dto/update-user-by-id.dto';
import { UserEntity } from './entities/user.entity';
import { IUserService } from './user.interface';
import { AuthGuard } from '@nestjs/passport';
import { AuthStrategy } from '../auth/auth.const';
import { AbilitiesGuard } from '@/module/ability/abilities.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('user')
@ApiController('User')
export class UserController {
	constructor(private readonly userService: IUserService) {}

	@Post()
	@ApiBearerAuth()
	@ApiCreate(UserEntity, 'User')
	@CheckAbilities({ action: PermissionEnum.CREATE, subject: UserEntity })
	create(@Body() createUserDto: CreateUserDto) {
		return this.userService.createUser(createUserDto);
	}

	@Get()
	@ApiBearerAuth()
	@ApiGetAll(UserEntity, 'User')
	getAll(@Query() query: PaginationDto) {
		return this.userService.getAllPaginated(query);
	}

	@Get(':id')
	@ApiBearerAuth()
	@UseGuards(AuthGuard(AuthStrategy.USER_JWT), AbilitiesGuard)
	@CheckAbilities({ action: PermissionEnum.GET, subject: UserEntity })
	@ApiGetOne(UserEntity, 'User')
	getOne(@Param('id') id: number) {
		return this.userService.getOneUserById(id);
	}

	@Patch(':id')
	@ApiBearerAuth()
	@ApiUpdate(UserEntity, 'User')
	update(@Param('id') id: number, @Body() updateUserDto: UpdateUserByIdDto) {
		return this.userService.updateUserById(id, updateUserDto);
	}

	@Delete(':id')
	@ApiBearerAuth()
	@ApiDelete(UserEntity, 'User')
	remove(@Param('id') id: number) {
		return this.userService.removeUserById(id);
	}
}
