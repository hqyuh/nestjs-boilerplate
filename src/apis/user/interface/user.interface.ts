import { PaginationDto } from '@/common/base/base.dto';
import { BaseService } from '@/common/base/base.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserByIdDto } from '../dto/update-user-by-id.dto';
import { UserEntity } from '../entities/user.entity';

export abstract class IUserService extends BaseService<UserEntity> {
    abstract validateUserByEmailPassword(email: string, password: string): Promise<UserEntity>;
    abstract validateUserById(id: string): Promise<UserEntity>;
    
    abstract createUser(createUserDto: CreateUserDto): Promise<UserEntity>;
    abstract getAllUserPaginated(query: PaginationDto): Promise<IPaginationResponse<UserEntity>>;
    abstract getOneUserById(id: string): Promise<UserEntity>;
    abstract removeUserById(id: string): Promise<UserEntity>;
    abstract updateUserById(id: string, updateUserDto: UpdateUserByIdDto): Promise<UserEntity>;
}
