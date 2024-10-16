import { PermissionEnum } from '@/apis/permissions/permission.enum';
import { RoleEnum } from '@/apis/roles/roles.enum';
import { UserEntity } from '@/apis/user/entities/user.entity';
import {
	AbilityBuilder,
	AbilityClass,
	ExtractSubjectType,
	InferSubjects,
	PureAbility
} from '@casl/ability';
import { Injectable } from '@nestjs/common';

export type Subjects = InferSubjects<typeof UserEntity> | 'all';

export type AppAbility = PureAbility<[PermissionEnum, Subjects]>;

@Injectable()
export class AbilityFactory {
	async defineAbility(user: User) {
		const { can, cannot, build } = new AbilityBuilder<PureAbility<[PermissionEnum, Subjects]>>(
			PureAbility as AbilityClass<PureAbility<[PermissionEnum, Subjects]>>
		);

		if (user.role.name === RoleEnum.ADMIN) {
			can(PermissionEnum.MANAGE, 'all');
		} else {
			cannot(PermissionEnum.GET, UserEntity);
			cannot(PermissionEnum.DELETE, UserEntity);
		}

		return build({
			detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>
		});
	}
}
