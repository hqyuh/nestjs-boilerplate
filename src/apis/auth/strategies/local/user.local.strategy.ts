import { AuthStrategy } from '@/apis/auth/auth.const';
import { IUserService } from '@/apis/user/user.interface';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class UserLocalStrategy extends PassportStrategy(Strategy, AuthStrategy.USER_LOCAL) {
	constructor(private readonly userService: IUserService) {
		super({
			usernameField: 'username',
			passwordField: 'password'
		});
	}

	async validate(username: string, password: string) {
		if (!username || !password) {
			throw new BadRequestException('Username or password must be provided');
		}

		return this.userService.validateUserByUsernamePassword(username, password);
	}
}
