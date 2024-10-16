import { AuthStrategy } from '@/apis/auth/auth.const';
import { IUserService } from '@/apis/user/user.interface';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AuthStrategy.USER_JWT) {
	constructor(private readonly userService: IUserService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET
		});
	}
	async validate(payload: UserJwtPayload) {
		const { id } = payload;
		return this.userService.validateUserById(id);
	}
}
