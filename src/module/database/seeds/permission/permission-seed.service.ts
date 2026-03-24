import { PermissionEntity } from '@/apis/permissions/entities/permission.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionSeedService {
  constructor(
    @InjectRepository(PermissionEntity)
    private repository: Repository<PermissionEntity>
  ) {}

  async run() {
    const count = await this.repository.count();

    if (count === 0) {
      await this.repository.save([
        this.repository.create({
          name: 'GET',
          description: 'Permission to view/read resources',
        }),
        this.repository.create({
          name: 'CREATE',
          description: 'Permission to create new resources',
        }),
        this.repository.create({
          name: 'UPDATE',
          description: 'Permission to update existing resources',
        }),
        this.repository.create({
          name: 'DELETE',
          description: 'Permission to delete resources',
        }),
        this.repository.create({
          name: 'MANAGE_USERS',
          description: 'Permission to manage users',
        }),
        this.repository.create({
          name: 'MANAGE_ROLES',
          description: 'Permission to manage roles and permissions',
        }),
      ]);
    }
  }
}
