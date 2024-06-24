import { Permission } from '@/apis/permissions/entities/permission.entity';
import { Role } from '@/apis/roles/entities/role.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RoleSeedService {
	constructor(
		@InjectRepository(Role)
		private repository: Repository<Role>,
		@InjectRepository(Permission)
		private repositoryPermission: Repository<Permission>
	) {}

	async run() {
		const permissions = await this.repositoryPermission.find();
		const countUser = await this.repository.count({
			where: {
				id: 1
			}
		});

		if (!countUser) {
			await this.repository.save(
				this.repository.create({
					id: 2,
					name: 'User',
					description: 'Role User',
					permissions: [
						...permissions.filter(
							(permission) =>
								permission.name === 'create' || permission.name === 'get'
						)
					]
				})
			);
		}

		const countAdmin = await this.repository.count({
			where: {
				id: 1
			}
		});

		if (!countAdmin) {
			await this.repository.save(
				this.repository.create({
					id: 1,
					name: 'Admin',
					description: 'Role Admin',
					permissions: [...permissions]
				})
			);
		}
	}
}
