import { PaginateConfig } from 'nestjs-paginate';

import { UserEntity } from './entities/user.entity';

const fields = ['id', 'createdAt', 'email', 'firstName', 'middleName', 'lastName', 'phoneNumber'] as const;

export const userPaginateConfig: PaginateConfig<UserEntity> = {
  sortableColumns: [...fields],
  select: [...fields],
  filterableColumns: {
    id: true,
    createdAt: true,
    email: true,
    firstName: true,
    middleName: true,
    lastName: true,
    phoneNumber: true,
  },
  defaultSortBy: [['createdAt', 'ASC']],
  defaultLimit: 10,
  maxLimit: 100,
  throwOnInvalidFilter: true,
};
