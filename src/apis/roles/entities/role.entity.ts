import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { PermissionEntity } from '@/apis/permissions/entities/permission.entity';
import { BaseUuidEntity } from '@/common/base/base-uuid.entity';

@Entity({ name: 'role' })
export class RoleEntity extends BaseUuidEntity {
  @Allow()
  @ApiProperty({ example: 'Admin' })
  @Column({ type: 'varchar' })
  name?: string;

  @Allow()
  @ApiProperty({ example: 'This is admin role' })
  @Column({ type: 'varchar' })
  description?: string;

  @ManyToMany(
    () => PermissionEntity,
    (permission) => permission.roles
  )
  @JoinTable({
    name: 'role_permissions_permission',
    joinColumns: [{ name: 'role_id', referencedColumnName: 'id' }],
    inverseJoinColumns: [{ name: 'permission_id', referencedColumnName: 'id' }],
  })
  permissions: PermissionEntity[];
}

export const Role = RoleEntity;
