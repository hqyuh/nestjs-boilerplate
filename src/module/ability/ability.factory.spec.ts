import { PermissionEnum } from '@/apis/permissions/permission.enum';
import { RoleEnum } from '@/apis/roles/roles.enum';
import { UserEntity } from '@/apis/user/entities/user.entity';

import { AbilityFactory } from './ability.factory';

const user = { id: 'user-1', role: RoleEnum.USER } as UserJwtPayload;
const admin = { id: 'admin-1', role: RoleEnum.ADMIN } as UserJwtPayload;
const own = Object.assign(new UserEntity(), { id: 'user-1' });
const other = Object.assign(new UserEntity(), { id: 'user-2' });

describe('AbilityFactory', () => {
  const factory = new AbilityFactory();

  it('lets a regular user get and update only their own record', async () => {
    const ability = await factory.defineAbility(user);

    expect(ability.can(PermissionEnum.GET, own)).toBe(true);
    expect(ability.can(PermissionEnum.UPDATE, own)).toBe(true);
    expect(ability.can(PermissionEnum.GET, other)).toBe(false);
    expect(ability.can(PermissionEnum.UPDATE, other)).toBe(false);
    expect(ability.can(PermissionEnum.GET, 'all')).toBe(false);
    expect(ability.can(PermissionEnum.CREATE, UserEntity)).toBe(false);
    expect(ability.can(PermissionEnum.DELETE, own)).toBe(false);
    expect(ability.can(PermissionEnum.DELETE, UserEntity)).toBe(false);
  });

  it('lets an admin manage every user action', async () => {
    const ability = await factory.defineAbility(admin);

    expect(ability.can(PermissionEnum.GET, UserEntity)).toBe(true);
    expect(ability.can(PermissionEnum.GET, other)).toBe(true);
    expect(ability.can(PermissionEnum.UPDATE, other)).toBe(true);
    expect(ability.can(PermissionEnum.CREATE, UserEntity)).toBe(true);
    expect(ability.can(PermissionEnum.DELETE, other)).toBe(true);
  });
});
