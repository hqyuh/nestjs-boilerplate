import { Permission } from '@/apis/permissions/entities/permission.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionSeedService {
	constructor(
		@InjectRepository(Permission)
		private repository: Repository<Permission>
	) {}

	async run() {
		await this.repository.save([
			this.repository.create({
				id: 1,
				name: 'GET',
				description: 'Permission Get'
			}),
			this.repository.create({
				id: 2,
				name: 'CREATE',
				description: 'Permission Create'
			}),
			this.repository.create({
				id: 3,
				name: 'UPDATE',
				description: 'Permission Update'
			}),
			this.repository.create({
				id: 4,
				name: 'DELETE',
				description: 'Permission Delete'
			})
		]);
	}
}
