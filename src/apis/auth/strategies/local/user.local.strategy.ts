import { AuthStrategy } from '@/apis/auth/auth.const';
import { IUserService } from '@/apis/user/user.interface';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class UserLocalStrategy extends PassportStrategy(Strategy, AuthStrategy.USER_LOCAL) {
	constructor(private userService: IUserService) {
		super({
			usernameField: 'username',
			passwordField: 'password'
		});
	}

	async validate(username: string, password: string) {
		console.log('local-strategy');
		return this.userService.validateUserByUsernamePassword(username, password);
	}
}
