import { RoleEntity } from '@/apis/roles/entities/role.entity';
import { UserEntity } from '@/apis/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>
  ) {}

  async run() {
    const count = await this.repository.count();

    if (count === 0) {
      // Get roles by name
      const adminRole = await this.roleRepository.findOne({ where: { name: 'Admin' } });
      const userRole = await this.roleRepository.findOne({ where: { name: 'User' } });

      if (!adminRole || !userRole) {
        throw new Error('Roles must be seeded before users');
      }

      const users = this.repository.create([
        // Admin users
        {
          email: 'admin01@example.com',
          firstName: 'Admin',
          lastName: 'User 01',
          password: '123456',
          middleName: null,
          phoneNumber: '+84901234567',
          avatarUrl: null,
          emailVerifiedAt: new Date(),
          roleId: adminRole.id,
        },
        {
          email: 'admin02@example.com',
          firstName: 'Admin',
          lastName: 'User 02',
          password: '123456',
          middleName: null,
          phoneNumber: '+84901234568',
          avatarUrl: null,
          emailVerifiedAt: new Date(),
          roleId: adminRole.id,
        },
        {
          email: 'admin03@example.com',
          firstName: 'Admin',
          lastName: 'User 03',
          password: '123456',
          middleName: null,
          phoneNumber: '+84901234569',
          avatarUrl: null,
          emailVerifiedAt: new Date(),
          roleId: adminRole.id,
        },
        // Regular users
        {
          email: 'user01@example.com',
          firstName: 'John',
          password: '123456',
          lastName: 'Doe',
          middleName: 'Michael',
          phoneNumber: '+84912345678',
          avatarUrl: null,
          emailVerifiedAt: new Date(),
          roleId: userRole.id,
        },
        {
          email: 'user02@example.com',
          firstName: 'Jane',
          password: '123456',
          lastName: 'Smith',
          middleName: null,
          phoneNumber: '+84912345679',
          avatarUrl: null,
          emailVerifiedAt: null,
          roleId: userRole.id,
        },
        {
          email: 'user03@example.com',
          firstName: 'Bob',
          password: '123456',
          lastName: 'Johnson',
          middleName: 'William',
          phoneNumber: '+84912345680',
          avatarUrl: null,
          emailVerifiedAt: new Date(),
          roleId: userRole.id,
        },
        {
          email: 'user04@example.com',
          firstName: 'Alice',
          password: '123456',
          lastName: 'Williams',
          middleName: null,
          phoneNumber: '+84912345681',
          avatarUrl: null,
          emailVerifiedAt: new Date(),
          roleId: userRole.id,
        },
        {
          email: 'user05@example.com',
          firstName: 'Charlie',
          password: '123456',
          lastName: 'Brown',
          middleName: 'David',
          phoneNumber: '+84912345682',
          avatarUrl: null,
          emailVerifiedAt: null,
          roleId: userRole.id,
        },
        {
          email: 'user06@example.com',
          firstName: 'Emma',
          password: '123456',
          lastName: 'Davis',
          middleName: null,
          phoneNumber: '+84912345683',
          avatarUrl: null,
          emailVerifiedAt: new Date(),
          roleId: userRole.id,
        },
        {
          email: 'user07@example.com',
          firstName: 'James',
          password: '123456',
          lastName: 'Wilson',
          middleName: 'Robert',
          phoneNumber: '+84912345684',
          avatarUrl: null,
          emailVerifiedAt: new Date(),
          roleId: userRole.id,
        },
        {
          email: 'user08@example.com',
          firstName: 'Sophia',
          password: '123456',
          lastName: 'Martinez',
          middleName: null,
          phoneNumber: '+84912345685',
          avatarUrl: null,
          emailVerifiedAt: null,
          roleId: userRole.id,
        },
        {
          email: 'user09@example.com',
          firstName: 'Liam',
          password: '123456',
          lastName: 'Anderson',
          middleName: 'Thomas',
          phoneNumber: '+84912345686',
          avatarUrl: null,
          emailVerifiedAt: new Date(),
          roleId: userRole.id,
        },
        {
          email: 'user10@example.com',
          firstName: 'Olivia',
          lastName: 'Taylor',
          password: '123456',
          middleName: null,
          phoneNumber: '+84912345687',
          avatarUrl: null,
          emailVerifiedAt: new Date(),
          roleId: userRole.id,
        },
        {
          email: 'user11@example.com',
          firstName: 'Noah',
          lastName: 'Thomas',
          password: '123456',
          middleName: 'Christopher',
          phoneNumber: '+84912345688',
          avatarUrl: null,
          emailVerifiedAt: null,
          roleId: userRole.id,
        },
        {
          email: 'user12@example.com',
          firstName: 'Ava',
          lastName: 'Jackson',
          password: '123456',
          middleName: null,
          phoneNumber: '+84912345689',
          avatarUrl: null,
          emailVerifiedAt: new Date(),
          roleId: userRole.id,
        },
        {
          email: 'user13@example.com',
          firstName: 'Ethan',
          lastName: 'White',
          middleName: 'Daniel',
          password: '123456',
          phoneNumber: '+84912345690',
          avatarUrl: null,
          emailVerifiedAt: new Date(),
          roleId: userRole.id,
        },
        {
          email: 'user14@example.com',
          firstName: 'Isabella',
          lastName: 'Harris',
          password: '123456',
          middleName: null,
          phoneNumber: '+84912345691',
          avatarUrl: null,
          emailVerifiedAt: null,
          roleId: userRole.id,
        },
        {
          email: 'user15@example.com',
          firstName: 'Mason',
          lastName: 'Martin',
          password: '123456',
          middleName: 'Joseph',
          phoneNumber: '+84912345692',
          avatarUrl: null,
          emailVerifiedAt: new Date(),
          roleId: userRole.id,
        },
      ]);

      await this.repository.save(users);
    }
  }
}
