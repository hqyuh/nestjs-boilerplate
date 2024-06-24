import { UserEntity } from '@/apis/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserSeedService {
	constructor(
		@InjectRepository(UserEntity)
		private repository: Repository<UserEntity>
	) {}

	async run() {
		const countAdmin = await this.repository.count({
			where: {
				role: {
					id: 1
				}
			}
		});

		if (!countAdmin) {
			await this.repository.save([
				this.repository.create({
					firstName: 'test firstName',
					lastName: 'test lasName',
					username: 'test01@example.com',
					password: 'test01',
					role: {
						id: 1,
						name: 'Admin'
					}
				}),
				this.repository.create({
					firstName: 'test firstName',
					lastName: 'test lasName',
					username: 'test02@example.com',
					password: 'test02',
					role: {
						id: 1,
						name: 'Admin'
					}
				}),
				this.repository.create({
					firstName: 'test firstName',
					lastName: 'test lasName',
					username: 'test03@example.com',
					password: 'test03',
					role: {
						id: 1,
						name: 'Admin'
					}
				})
			]);
		}

		const countUser = await this.repository.count({
			where: {
				role: {
					id: 2
				}
			}
		});

		if (!countUser) {
			await this.repository.save([
				this.repository.create({
					firstName: 'test firstName',
					lastName: 'test lasName',
					username: 'test04@example.com',
					password: 'test04',
					role: {
						id: 2,
						name: 'Admin'
					}
				}),
				this.repository.create({
					firstName: 'test firstName',
					lastName: 'test lasName',
					username: 'test05@example.com',
					password: 'test05',
					role: {
						id: 2,
						name: 'Admin'
					}
				}),
				this.repository.create({
					firstName: 'test firstName',
					lastName: 'test lasName',
					username: 'test06@example.com',
					password: 'test06',
					role: {
						id: 2,
						name: 'Admin'
					}
				}),
				this.repository.create({
					firstName: 'test firstName',
					lastName: 'test lasName',
					username: 'test07@example.com',
					password: 'test07',
					role: {
						id: 2,
						name: 'Admin'
					}
				}),
				this.repository.create({
					firstName: 'test firstName',
					lastName: 'test lasName',
					username: 'test08@example.com',
					password: 'test08',
					role: {
						id: 2,
						name: 'Admin'
					}
				}),
				this.repository.create({
					firstName: 'test firstName',
					lastName: 'test lasName',
					username: 'test09@example.com',
					password: 'test09',
					role: {
						id: 2,
						name: 'Admin'
					}
				}),
				this.repository.create({
					firstName: 'test firstName',
					lastName: 'test lasName',
					username: 'test10@example.com',
					password: 'test10',
					role: {
						id: 2,
						name: 'Admin'
					}
				})
			]);
		}
	}
}
