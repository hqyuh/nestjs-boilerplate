import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { verify } from 'argon2';
import { DeepPartial, Repository } from 'typeorm';
import { RoleEntity } from '@/apis/roles/entities/role.entity';
import { PaginationDto } from '@/common/base/base.dto';
import { BaseUuidEntity } from '@/common/base/base-uuid.entity';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserByIdDto } from '../dto/update-user-by-id.dto';
import { UserEntity } from '../entities/user.entity';
import { IUserService } from '../interface/user.interface';
import { UserRepository } from '../user.repository';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly userRepository: UserRepository,
    @InjectRepository(RoleEntity) private readonly roleRepo: Repository<RoleEntity>
  ) {}

  async validateUserByEmailPassword(email: string, password: string): Promise<UserEntity> {
    const user = await this.userRepository.getOne({ where: { email } });
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
    return this.userRepository.getOneByIdOrFail(id);
  }

  async createUser(createUserDto: CreateUserDto) {
    // TODO: The password will be automatically generated or entered by the user
    createUserDto.password = 'password';
    const role = await this.roleRepo.findOne({ where: { id: createUserDto.roleId } });

    if (!role) throw new NotFoundException('Role not found');

    return this.userRepository.create({
      email: createUserDto.username,
      password: createUserDto.password,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      roleId: createUserDto.roleId,
      role,
    });
  }

  async getAllUserPaginated(query: PaginationDto<BaseUuidEntity>): Promise<IPaginationResponse<UserEntity>> {
    return this.userRepository.getAllPaginated(query);
  }

  async getOneUserById(id: string) {
    return this.userRepository.getOneByIdOrFail(id);
  }

  async removeUserById(id: string) {
    return this.userRepository.softRemoveById(id);
  }

  async updateUserById(id: string, updateUserDto: UpdateUserByIdDto) {
    return this.userRepository.updateById(id, updateUserDto);
  }

  create(data: DeepPartial<UserEntity>): Promise<UserEntity> {
    return this.userRepository.create(data);
  }

  getOne(options: FindOptions<UserEntity>): Promise<UserEntity | null> {
    return this.userRepository.getOne(options);
  }
}
