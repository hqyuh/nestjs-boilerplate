import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthStrategy } from '../../auth.const';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, AuthStrategy.USER_RF_JWT) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_SECRET,
			passReqToCallback: true
		});
	}

	validate(req: Request, payload: UserJwtPayload) {
		const refreshToken = req.get('Authorization').replace('Bearer', '').trim();

		if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

		return {
			...payload,
			refreshToken
		};
	}
}
