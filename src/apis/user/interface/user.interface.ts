import { PaginationDto } from '@/common/base/base.dto';
import { DeepPartial } from 'typeorm';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserByIdDto } from '../dto/update-user-by-id.dto';
import { UserEntity } from '../entities/user.entity';

export const IUserService = Symbol('IUserService');

export interface IUserService {
  validateUserByEmailPassword(email: string, password: string): Promise<UserEntity>;
  validateUserById(id: string): Promise<UserEntity>;
  createUser(createUserDto: CreateUserDto): Promise<UserEntity>;
  getAllUserPaginated(query: PaginationDto): Promise<IPaginationResponse<UserEntity>>;
  getOneUserById(id: string): Promise<UserEntity>;
  removeUserById(id: string): Promise<UserEntity>;
  updateUserById(id: string, updateUserDto: UpdateUserByIdDto): Promise<UserEntity>;
  create(data: DeepPartial<UserEntity>): Promise<UserEntity>;
  getOne(options: FindOptions<UserEntity>): Promise<UserEntity | null>;
}
