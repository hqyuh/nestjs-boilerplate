import { AuthStrategy } from '@/apis/auth/auth.const';
import { IUserService } from '@/apis/user/user.interface';
import { AccessControlLists, Token } from '@/common/enums/auth.enum';
import { ICacheService } from '@/module/cache/cache.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AuthStrategy.USER_JWT) {
  constructor(
    private readonly userService: IUserService,
    private readonly cacheService: ICacheService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }
  async validate(request: Request, payload: UserJwtPayload) {
    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    const accessJti = payload?.jti;
    if (accessToken) {
      const isBlacklisted = await this.cacheService.get(`${AccessControlLists.BLACK}:${Token.ACCESS}:${accessJti}`);

      if (isBlacklisted) {
        throw new UnauthorizedException('token revoked');
      }
    }

    const { id } = payload;
    const user = await this.userService.validateUserById(id);

    request.user = user;

    return payload;
  }
}
