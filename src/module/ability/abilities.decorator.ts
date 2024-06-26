import { PermissionEnum } from '@/apis/permissions/permission.enum';
import { SetMetadata } from '@nestjs/common/decorators';

import { Subjects } from './ability.factory';

export const CHECK_ABILITY = 'check_ability';

export interface RequiredRule {
	action: PermissionEnum;
	subject: Subjects;
}

export const CheckAbilities = (...requirements: RequiredRule[]) =>
	SetMetadata(CHECK_ABILITY, requirements);
