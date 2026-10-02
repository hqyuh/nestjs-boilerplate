import { PermissionEnum } from '@/apis/permissions/permission.enum';
import { RoleEnum } from '@/apis/roles/roles.enum';
import { UserEntity } from '@/apis/user/entities/user.entity';
import { AbilityBuilder, createMongoAbility, ExtractSubjectType, InferSubjects, MongoAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';

export type Subjects = InferSubjects<typeof UserEntity> | 'all';

export type AppAbility = MongoAbility<[PermissionEnum, Subjects]>;

@Injectable()
export class AbilityFactory {
  async defineAbility(user: User | UserJwtPayload) {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
    const roleName = typeof user.role === 'string' ? user.role : user.role?.name;

    if (roleName === RoleEnum.ADMIN) {
      can(PermissionEnum.MANAGE, 'all');
    } else {
      can(PermissionEnum.GET, UserEntity, { id: user.id });
      can(PermissionEnum.UPDATE, UserEntity, { id: user.id });
    }

    return build({
      detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
