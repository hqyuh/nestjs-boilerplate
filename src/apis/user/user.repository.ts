import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery } from 'nestjs-paginate';
import { Repository } from 'typeorm';
import { BaseService } from '@/common/base/base.service';
import { paginateWithErrors } from '@/common/utils/paginate-with-errors';

import { UserEntity } from './entities/user.entity';
import { userPaginateConfig } from './user.paginate';

@Injectable()
export class UserRepository extends BaseService<UserEntity> {
  notFoundMessage = 'User not found';

  constructor(@InjectRepository(UserEntity) private readonly repo: Repository<UserEntity>) {
    super(repo);
  }

  paginateAll(query: PaginateQuery) {
    return paginateWithErrors(query, this.repo, userPaginateConfig);
  }
}
