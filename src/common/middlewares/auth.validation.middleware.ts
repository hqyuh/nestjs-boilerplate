import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { validateOrReject } from 'class-validator';
import { NextFunction, Response } from 'express';
import { LoginUserDto } from './../../apis/auth/dto/login-user.dto';
@Injectable()
export class AuthValidationMiddleware implements NestMiddleware {
	async use(req: Request, _res: Response, next: NextFunction) {
		const body: any = req.body;
		const login = new LoginUserDto();
		const errors: any = [];

		Object.keys(body).forEach((key) => {
			login[key] = body[key];
		});

		try {
			await validateOrReject(login);
		} catch (errs) {
			errs.forEach((err: any) => {
				Object.values(err.constraints).forEach((message: string) => {
					return errors.push(`${err.property}: ${message}`.replace('{property}', ''));
				});
			});
		}

		if (errors.length) {
			throw new BadRequestException(errors);
		}

		next();
	}
}
