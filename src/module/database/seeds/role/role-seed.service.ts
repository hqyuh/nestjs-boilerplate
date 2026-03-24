import { PermissionEntity } from '@/apis/permissions/entities/permission.entity';
import { RoleEntity } from '@/apis/roles/entities/role.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RoleSeedService {
  constructor(
    @InjectRepository(RoleEntity)
    private repository: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private repositoryPermission: Repository<PermissionEntity>
  ) {}

  async run() {
    const permissions = await this.repositoryPermission.find();

    const count = await this.repository.count();

    if (count === 0) {
      // Admin role - all permissions
      const adminRole = await this.repository.save({
        name: 'Admin',
        description: 'Administrator role with full system access',
        permissions: [...permissions],
      });

      // User role - limited permissions
      const userRole = await this.repository.save({
        name: 'User',
        description: 'Regular user role with basic permissions',
        permissions: permissions.filter(
          (permission) => permission.name === 'GET' || permission.name === 'CREATE' || permission.name === 'UPDATE'
        ),
      });

      // Moderator role - can manage content
      const moderatorRole = await this.repository.save({
        name: 'Moderator',
        description: 'Moderator role for content management',
        permissions: permissions.filter(
          (permission) => permission.name === 'GET' || permission.name === 'CREATE' || permission.name === 'UPDATE'
        ),
      });

      return { adminRole, userRole, moderatorRole };
    }
  }
}
