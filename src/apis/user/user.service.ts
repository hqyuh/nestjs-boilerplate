import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { verify } from 'argon2';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { IUserService } from './user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationDto } from '@/common/base/base.dto';
import { BaseEntity } from '@/common/base/base.entity';
import { UpdateUserByIdDto } from './dto/update-user-by-id.dto';
import { ICacheService } from '@/module/cache/cache.interface';

@Injectable()
export class UserService extends IUserService {
	notFoundMessage = 'User not found';

	constructor(@InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>, 
	private readonly cacheService: ICacheService) {
		super(userRepo);
	}

	async validateUserByUsernamePassword(username: string, password: string): Promise<UserEntity> {
		const user = await this.getOne({ where: { username } });
		if (!user) {
			throw new UnauthorizedException('User not found');
		}
		const comparePassword = await verify(user.password, password);
		if (!comparePassword) {
			throw new UnauthorizedException('Incorrect password');
		}
		return user;
	}

	async validateUserById(id: number): Promise<UserEntity> {
		return this.getOneByIdOrFail(id);
	}

	async createUser(createUserDto: CreateUserDto) {
		return this.create(createUserDto);
	}

	async getAllUserPaginated(
		query: PaginationDto<BaseEntity>
	): Promise<IPaginationResponse<UserEntity>> {
		return this.getAllPaginated(query);
	}

	async getOneUserById(id: number) {
		return this.getOneByIdOrFail(id);
	}

	async removeUserById(id: number) {
		return this.softRemoveById(id);
	}

	async updateUserById(id: number, updateUserDto: UpdateUserByIdDto) {
		return this.updateById(id, updateUserDto);
	}
}
