import { BaseEntity } from '@/common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { Permission } from '@/apis/permissions/entities/permission.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

@Entity({ name: 'role' })
export class Role extends BaseEntity {
	@Allow()
	@ApiProperty({ example: 'Admin' })
	@Column()
	name?: string;

	@Allow()
	@ApiProperty({ example: 'This is admin role' })
	@Column()
	description?: string;

	@ManyToMany(() => Permission, (permission) => permission.roles)
	@JoinTable({
		name: 'role_permissions_permission',
		joinColumns: [{ name: 'roleId', referencedColumnName: 'id' }],
		inverseJoinColumns: [{ name: 'permissionId', referencedColumnName: 'id' }]
	})
	permissions: Permission[];
}
