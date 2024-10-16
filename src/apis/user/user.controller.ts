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
import { AbilitiesGuard } from '@/module/ability/abilities.guard';
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthStrategy } from '../auth/auth.const';
import { PermissionEnum } from '../permissions/permission.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserByIdDto } from './dto/update-user-by-id.dto';
import { UserEntity } from './entities/user.entity';
import { IUserService } from './user.interface';

@Controller('user')
@ApiController('User')
export class UserController {
	constructor(private readonly userService: IUserService) {}

	@Post()
	@ApiBearerAuth()
	@ApiCreate(UserEntity, 'User')
	@UseGuards(AuthGuard(AuthStrategy.USER_JWT), AbilitiesGuard)
	@CheckAbilities({ action: PermissionEnum.CREATE, subject: UserEntity })
	create(@Body() createUserDto: CreateUserDto) {
		return this.userService.createUser(createUserDto);
	}

	@Get()
	@ApiBearerAuth()
	@ApiGetAll(UserEntity, 'User')
	@UseGuards(AuthGuard(AuthStrategy.USER_JWT), AbilitiesGuard)
	@CheckAbilities({ action: PermissionEnum.GET, subject: UserEntity })
	getAll(@Query() query: PaginationDto) {
		return this.userService.getAllUserPaginated(query);
	}

	@Get(':id')
	@ApiBearerAuth()
	@ApiGetOne(UserEntity, 'User')
	@UseGuards(AuthGuard(AuthStrategy.USER_JWT), AbilitiesGuard)
	@CheckAbilities({ action: PermissionEnum.GET, subject: UserEntity })
	getOne(@Param('id') id: number) {
		return this.userService.getOneUserById(id);
	}

	@Patch(':id')
	@ApiBearerAuth()
	@ApiUpdate(UserEntity, 'User')
	@UseGuards(AuthGuard(AuthStrategy.USER_JWT), AbilitiesGuard)
	@CheckAbilities({ action: PermissionEnum.UPDATE, subject: UserEntity })
	update(@Param('id') id: number, @Body() updateUserDto: UpdateUserByIdDto) {
		return this.userService.updateUserById(id, updateUserDto);
	}

	@Delete(':id')
	@ApiBearerAuth()
	@ApiDelete(UserEntity, 'User')
	@UseGuards(AuthGuard(AuthStrategy.USER_JWT), AbilitiesGuard)
	@CheckAbilities({ action: PermissionEnum.DELETE, subject: UserEntity })
	remove(@Param('id') id: number) {
		return this.userService.removeUserById(id);
	}
}
