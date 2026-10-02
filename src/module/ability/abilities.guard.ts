import { ForbiddenError } from '@casl/ability';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserEntity } from '@/apis/user/entities/user.entity';

import { CHECK_ABILITY, RequiredRule } from './abilities.decorator';
import { AbilityFactory, Subjects } from './ability.factory';

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly caslAbilityFactory: AbilityFactory
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rules = this.reflector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) || [];
    const request = context.switchToHttp().getRequest();
    const ability = await this.caslAbilityFactory.defineAbility(request.user);
    try {
      rules.forEach((rule) => {
        ForbiddenError.from(ability).throwUnlessCan(rule.action, this.toSubject(rule.subject, request.params?.id));
      });
      return true;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new ForbiddenException({
          status: 403,
          message: 'You do not have permission to perform this action.',
          errors: error.message,
        });
      }
    }
  }

  private toSubject(subject: RequiredRule['subject'], id?: string): Subjects {
    if (!id || typeof subject !== 'function') return subject;
    return Object.assign(new UserEntity(), { id });
  }
}
