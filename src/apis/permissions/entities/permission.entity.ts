import { Role } from '@/apis/roles/entities/role.entity';
import { BaseEntity } from '@/common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { Column, Entity, ManyToMany } from 'typeorm';

@Entity({ name: 'permission' })
export class Permission extends BaseEntity {
	@Allow()
	@ApiProperty({ example: 'This is name role' })
	@Column()
	name?: string;

	@Allow()
	@ApiProperty({ example: 'This is permission role' })
	@Column()
	description?: string;

	@ManyToMany(() => Role, (role) => role.permissions)
	roles: Role[];
}
