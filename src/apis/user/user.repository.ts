import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '@/common/base/base.service';

import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserRepository extends BaseService<UserEntity> {
  notFoundMessage = 'User not found';

  constructor(@InjectRepository(UserEntity) repository: Repository<UserEntity>) {
    super(repository);
  }
}
