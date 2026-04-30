import { RoleEntity } from '@/apis/roles/entities/role.entity';
import { ICacheService } from '@/module/cache/cache.interface';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

jest.mock('argon2', () => ({
  verify: jest.fn(),
  hash: jest.fn().mockResolvedValue('hashed'),
}));

jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => undefined,
}));

import { verify } from 'argon2';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserByIdDto } from '../dto/update-user-by-id.dto';
import { UserEntity } from '../entities/user.entity';
import { UserService } from './user.service';

const buildEntity = (overrides: Partial<UserEntity> = {}): UserEntity => {
  const entity: any = {
    id: 'user-id',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashed-password',
    role: { id: 'role-id', name: 'admin' } as RoleEntity,
    ...overrides,
  };
  entity.save = jest.fn().mockResolvedValue(entity);
  return entity as UserEntity;
};

describe('UserService (v1)', () => {
  let service: UserService;
  let userRepo: jest.Mocked<Repository<UserEntity>>;
  let roleRepo: jest.Mocked<Repository<RoleEntity>>;
  let cacheService: jest.Mocked<ICacheService>;

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      softRemove: jest.fn(),
    } as unknown as jest.Mocked<Repository<UserEntity>>;

    roleRepo = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<RoleEntity>>;

    cacheService = {
      set: jest.fn(),
      setMany: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    } as unknown as jest.Mocked<ICacheService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: getRepositoryToken(RoleEntity), useValue: roleRepo },
        { provide: ICacheService, useValue: cacheService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUserByEmailPassword', () => {
    it('throws when user is not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.validateUserByEmailPassword('a@b.com', 'pw')).rejects.toBeInstanceOf(
        UnauthorizedException
      );
      expect(verify).not.toHaveBeenCalled();
    });

    it('throws when user has no password', async () => {
      userRepo.findOne.mockResolvedValue(buildEntity({ password: null as never }));

      await expect(service.validateUserByEmailPassword('a@b.com', 'pw')).rejects.toBeInstanceOf(
        UnauthorizedException
      );
      expect(verify).not.toHaveBeenCalled();
    });

    it('throws when password does not match', async () => {
      userRepo.findOne.mockResolvedValue(buildEntity());
      (verify as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUserByEmailPassword('a@b.com', 'pw')).rejects.toBeInstanceOf(
        UnauthorizedException
      );
    });

    it('returns the user on success', async () => {
      const user = buildEntity();
      userRepo.findOne.mockResolvedValue(user);
      (verify as jest.Mock).mockResolvedValue(true);

      await expect(service.validateUserByEmailPassword('a@b.com', 'pw')).resolves.toBe(user);
      expect(verify).toHaveBeenCalledWith(user.password, 'pw');
    });
  });

  describe('validateUserById', () => {
    it('returns the user when found', async () => {
      const user = buildEntity();
      userRepo.findOne.mockResolvedValue(user);

      await expect(service.validateUserById('user-id')).resolves.toBe(user);
    });

    it('throws NotFoundException when user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.validateUserById('missing-id')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('createUser', () => {
    const createDto = {
      username: 'jdoe',
      password: 'temp',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      roleId: 'role-id',
    } as CreateUserDto;

    it('throws NotFoundException when role does not exist', async () => {
      roleRepo.findOne.mockResolvedValue(null);

      await expect(service.createUser({ ...createDto })).rejects.toBeInstanceOf(NotFoundException);
      expect(userRepo.create).not.toHaveBeenCalled();
    });

    it('creates the user with defaulted password and resolved role', async () => {
      const role = { id: 'role-id', name: 'admin' } as RoleEntity;
      roleRepo.findOne.mockResolvedValue(role);
      const created = buildEntity();
      userRepo.create.mockReturnValue(created);

      const result = await service.createUser({ ...createDto });

      expect(roleRepo.findOne).toHaveBeenCalledWith({ where: { id: 'role-id' } });
      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'password', role })
      );
      expect(created.save).toHaveBeenCalled();
      expect(result).toBe(created);
    });
  });

  describe('getAllUserPaginated', () => {
    it('returns paginated response from repository', async () => {
      const data = [buildEntity()];
      userRepo.findAndCount.mockResolvedValue([data, 1]);

      const result = await service.getAllUserPaginated({ limit: 10, page: 1 } as never);

      expect(userRepo.findAndCount).toHaveBeenCalled();
      expect(result).toEqual({ data, pagination: { limit: 10, page: 1, total: 1 } });
    });
  });

  describe('getOneUserById', () => {
    it('returns the user when found', async () => {
      const user = buildEntity();
      userRepo.findOne.mockResolvedValue(user);

      await expect(service.getOneUserById('user-id')).resolves.toBe(user);
    });

    it('throws NotFoundException when not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.getOneUserById('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('removeUserById', () => {
    it('soft removes the user when found', async () => {
      const user = buildEntity();
      userRepo.findOne.mockResolvedValue(user);
      userRepo.softRemove.mockResolvedValue(user);

      await expect(service.removeUserById('user-id')).resolves.toBe(user);
      expect(userRepo.softRemove).toHaveBeenCalledWith(user);
    });

    it('throws NotFoundException when user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.removeUserById('missing')).rejects.toBeInstanceOf(NotFoundException);
      expect(userRepo.softRemove).not.toHaveBeenCalled();
    });
  });

  describe('updateUserById', () => {
    const updateDto = { firstName: 'Updated' } as UpdateUserByIdDto;

    it('updates the user when found', async () => {
      const user = buildEntity();
      userRepo.findOne.mockResolvedValue(user);

      const result = await service.updateUserById('user-id', updateDto);

      expect(user.save).toHaveBeenCalled();
      expect(result.firstName).toBe('Updated');
    });

    it('throws NotFoundException when user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.updateUserById('missing', updateDto)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
