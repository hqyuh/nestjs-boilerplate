import { randomUUID } from 'node:crypto';
import { SuccessResponse } from '@/common/base/success-response';
import { AccessControlLists, Token } from '@/common/enums/auth.enum';
import { Result } from '@/common/types/auth.dto';
import { ICacheService } from '@/module/cache/cache.interface';
import { AppConfig, JWTConfig } from '@/module/configs/interfaces/config.interface';
import { IJwtService } from '@/module/jwt/jwt.interface';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheableItem } from 'cacheable';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';

import { IUserService } from '../user/user.interface';
import { IAuthService } from './auth.interface';
import { AuthTokens, LoginDTO, RegisterDTO } from './dto/auth.dto';

type JtiTokens = AuthTokens & {
  accessJti: string;
  refreshJti: string;
};

@Injectable()
export class AuthService extends IAuthService {
  constructor(
    private readonly jwtService: IJwtService,
    private readonly configService: ConfigService,
    private readonly cacheService: ICacheService,
    private readonly userService: IUserService,
    private readonly i18n: I18nService
  ) {
    super();
  }

  async login(loginUserDto: LoginDTO, response: Response): Promise<SuccessResponse<AuthTokens>> {
    const {
      jwt: { expirationTime, refreshTime },
      cookie: { sameSite, maxAge },
    } = this.configService.getOrThrow<AppConfig>('app');

    const { email, password } = loginUserDto;

    const user = await this.userService.validateUserByEmailPassword(email, password);

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      fisrtName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
    };

    const { accessToken, refreshToken, accessJti, refreshJti } = await this.generateToken(payload);

    // add access token and refresh token to White list
    const setCache: CacheableItem[] = [
      {
        key: `${AccessControlLists.WHITE}:${Token.ACCESS}:${accessJti}`,
        value: accessToken,
        ttl: expirationTime * 1000,
      },
      {
        key: `${AccessControlLists.WHITE}:${Token.REFRESH}:${refreshJti}`,
        value: refreshToken,
        ttl: refreshTime * 1000,
      },
    ];

    this.cacheService.setMany(setCache);

    response.cookie(Token.REFRESH, refreshToken, {
      httpOnly: true,
      sameSite,
      maxAge,
    });

    return new SuccessResponse({
      data: { accessToken, refreshToken },
      message: await this.i18n.t('auth.login_success'),
    });
  }

  async register(registerDto: RegisterDTO): Promise<SuccessResponse<Result>> {
    // Check if user already exists
    const user = await this.userService.getOne({ where: { email: registerDto.email } });

    // If user already exists, throw conflict exception
    if (user) throw new ConflictException(this.i18n.t('conflict_user'));

    // Create new user
    await this.userService.create({
      email: registerDto.email,
      password: registerDto.password,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    });

    return new SuccessResponse({
      data: {
        success: true,
      },
      message: await this.i18n.t('auth.register_success'),
    });
  }

  private async generateToken(payload: JwtPayload): Promise<JtiTokens> {
    const accessJti = randomUUID();
    const refreshJti = randomUUID();
    const { expirationTime, refreshTime } = this.configService.getOrThrow<JWTConfig>('app.jwt');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(payload, {
        expiresIn: expirationTime,
        jwtid: accessJti,
      }),
      this.jwtService.sign(payload, {
        expiresIn: refreshTime,
        jwtid: refreshJti,
      }),
    ]);

    return { accessToken, refreshToken, accessJti, refreshJti };
  }

  async refreshToken(authTokens: AuthTokens, response: Response): Promise<SuccessResponse<AuthTokens>> {
    const {
      jwt: { expirationTime, refreshTime },
      cookie: { sameSite, maxAge },
    } = this.configService.getOrThrow<AppConfig>('app');

    // verify refresh token
    const accessPayload = await this.jwtService.verify(authTokens.accessToken);
    const refreshPayload = await this.jwtService.verify(authTokens.refreshToken);

    const user = await this.userService.getOne({ where: { id: refreshPayload.id } });

    // get current refresh token
    const cachedRefreshToken = await this.cacheService.get(
      `${AccessControlLists.WHITE}:${Token.REFRESH}:${refreshPayload.jti}`
    );

    if (!cachedRefreshToken || cachedRefreshToken !== authTokens.refreshToken) {
      throw new UnauthorizedException(this.i18n.t('access_denied'));
    }

    this.cacheService.deleteMany([
      `${AccessControlLists.WHITE}:${Token.ACCESS}:${accessPayload.jti}`,
      `${AccessControlLists.WHITE}:${Token.REFRESH}:${refreshPayload.jti}`,
    ]);

    // renew auth token
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      fisrtName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
    };

    const { accessToken, refreshToken, accessJti, refreshJti } = await this.generateToken(payload);

    response.cookie(Token.REFRESH, refreshToken, {
      httpOnly: true,
      sameSite,
      maxAge,
    });

    // add access token and refresh token to White list
    const setCache: CacheableItem[] = [
      {
        key: `${AccessControlLists.WHITE}:${Token.ACCESS}:${accessJti}`,
        value: accessToken,
        ttl: expirationTime * 1000,
      },
      {
        key: `${AccessControlLists.WHITE}:${Token.REFRESH}:${refreshJti}`,
        value: refreshToken,
        ttl: refreshTime * 1000,
      },
    ];

    this.cacheService.setMany(setCache);

    return new SuccessResponse({
      data: { accessToken, refreshToken },
      message: await this.i18n.t('auth.refresh_token_success'),
    });
  }

  async logout(authTokens: AuthTokens): Promise<SuccessResponse<Result>> {
    const { accessToken, refreshToken } = authTokens;

    const accessPayload = await this.jwtService.verify(accessToken);
    const refreshPayload = await this.jwtService.verify(refreshToken);

    if (!accessPayload || !refreshPayload) {
      throw new UnauthorizedException(this.i18n.t('access_denied'));
    }

    // keep blacklist entries for 7 days
    const blacklistTtl = 7 * 24 * 60 * 60 * 1000;

    // delete current access token and refresh token to White list
    this.cacheService.deleteMany([
      `${AccessControlLists.WHITE}:${Token.ACCESS}:${accessPayload.jti}`,
      `${AccessControlLists.WHITE}:${Token.REFRESH}:${refreshPayload.jti}`,
    ]);

    // add data to black list
    const setCacheBlacklist: CacheableItem[] = [
      {
        key: `${AccessControlLists.BLACK}:${Token.ACCESS}:${accessPayload.jti}`,
        value: accessToken,
        ttl: blacklistTtl,
      },
      {
        key: `${AccessControlLists.BLACK}:${Token.REFRESH}:${refreshPayload.jti}`,
        value: refreshToken,
        ttl: blacklistTtl,
      },
    ];

    this.cacheService.setMany(setCacheBlacklist);

    return new SuccessResponse({
      data: { success: true },
      message: await this.i18n.t('auth.logout_success'),
    });
  }
}
