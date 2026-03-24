import { RoleEntity } from '@/apis/roles/entities/role.entity';
import { BaseUuidEntity } from '@/common/base/base-uuid.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { Column, Entity, ManyToMany } from 'typeorm';

@Entity({ name: 'permission' })
export class PermissionEntity extends BaseUuidEntity {
  @Allow()
  @ApiProperty({ example: 'This is name role' })
  @Column()
  name?: string;

  @Allow()
  @ApiProperty({ example: 'This is permission role' })
  @Column()
  description?: string;

  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles: RoleEntity[];
}
