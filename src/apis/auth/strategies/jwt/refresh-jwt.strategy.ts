import { AccessControlLists, Token } from '@/common/enums/auth.enum';
import { ICacheService } from '@/module/cache/cache.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthStrategy } from '../../auth.const';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, AuthStrategy.USER_RF_JWT) {
  constructor(private readonly cacheService: ICacheService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req.cookies['refresh-token'];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: UserJwtPayload) {
    const refreshToken = req.cookies[`${Token.REFRESH}`];
    const refreshJti = payload?.jti;

    if (refreshToken) {
      // check blacklist refresh token
      const isBlacklisted = await this.cacheService.get(`${AccessControlLists.BLACK}:${Token.REFRESH}:${refreshJti}`);

      if (isBlacklisted) {
        throw new UnauthorizedException('token revoked');
      }
    }

    return {
      ...payload,
    };
  }
}
