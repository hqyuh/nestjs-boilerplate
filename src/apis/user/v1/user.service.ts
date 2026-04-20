import { RoleEntity } from '@/apis/roles/entities/role.entity';
import { BaseUuidEntity } from '@/common/base/base-uuid.entity';
import { PaginationDto } from '@/common/base/base.dto';
import { ICacheService } from '@/module/cache/cache.interface';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { verify } from 'argon2';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserByIdDto } from '../dto/update-user-by-id.dto';
import { UserEntity } from '../entities/user.entity';
import { IUserService } from '../interface/user.interface';

@Injectable()
export class UserService extends IUserService {
  notFoundMessage = 'User not found';

  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity) private readonly roleRepo: Repository<RoleEntity>,
    private readonly cacheService: ICacheService
  ) {
    super(userRepo);
  }

  async validateUserByEmailPassword(email: string, password: string): Promise<UserEntity> {
    const user = await this.getOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Incorrect email or password');
    }
    if (!user.password) {
      throw new UnauthorizedException('Incorrect email or password');
    }
    const comparePassword = await verify(user.password, password);
    if (!comparePassword) {
      throw new UnauthorizedException('Incorrect email or password');
    }
    return user;
  }

  async validateUserById(id: string): Promise<UserEntity> {
    return this.getOneByIdOrFail(id);
  }

  @Transactional()
  async createUser(createUserDto: CreateUserDto) {
    // TODO: The password will be automatically generated or entered by the user
    createUserDto.password = 'password';
    const role = await this.roleRepo.findOne({ where: { id: createUserDto.roleId } });

    if (!role) throw new NotFoundException('Role not found');

    return this.create({
      ...createUserDto,
      role,
    });
  }

  async getAllUserPaginated(query: PaginationDto<BaseUuidEntity>): Promise<IPaginationResponse<UserEntity>> {
    return this.getAllPaginated(query);
  }

  async getOneUserById(id: string) {
    return this.getOneByIdOrFail(id);
  }

  async removeUserById(id: string) {
    return this.softRemoveById(id);
  }

  async updateUserById(id: string, updateUserDto: UpdateUserByIdDto) {
    return this.updateById(id, updateUserDto);
  }
}
