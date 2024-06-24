import { PaginationDto } from '@/common/base/base.dto';
import { BaseService } from '@/common/base/base.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserByIdDto } from './dto/update-user-by-id.dto';
import { UserEntity } from './entities/user.entity';

export abstract class IUserService extends BaseService<UserEntity> {
    abstract validateUserByUsernamePassword(username: string, password: string): Promise<UserEntity>;
    abstract validateUserById(id: number): Promise<UserEntity>;
    
    abstract createUser(createUserDto: CreateUserDto): Promise<UserEntity>;
    abstract getAllUserPaginated(query: PaginationDto): Promise<IPaginationResponse<UserEntity>>;
    abstract getOneUserById(id: number): Promise<UserEntity>;
    abstract removeUserById(id: number): Promise<UserEntity>;
    abstract updateUserById(id: number, updateUserDto: UpdateUserByIdDto): Promise<UserEntity>;
}
