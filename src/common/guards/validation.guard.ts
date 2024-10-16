import { LoginUserDto } from '@/apis/auth/dto/login-user.dto';
import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { validate } from 'class-validator';

@Injectable()
export class ValidationGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const body = request.body;

		const loginUserDto = new LoginUserDto();
		Object.assign(loginUserDto, body);

		const validationErrors = await validate(loginUserDto);

		if (validationErrors.length > 0) {
			const formattedErrors = validationErrors.map((error) => ({
				property: error.property,
				error: Object.values(error.constraints || {}).join(', ')
			}));

			throw new BadRequestException({
				errors: formattedErrors
			});
		}

		return true;
	}
}
