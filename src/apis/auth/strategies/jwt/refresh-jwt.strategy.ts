import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { AuthStrategy } from '../../auth.const';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  AuthStrategy.USER_RF_JWT,
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: UserJwtPayload) {
    const refreshToken = req.get('Authorization').replace('Bearer', '').trim();

    // if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

    return {
      ...payload,
      refreshToken,
    };
  }
}