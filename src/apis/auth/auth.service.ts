import { randomUUID } from 'node:crypto';
import { ConflictException, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { verify } from 'argon2';
import { CacheableItem } from 'cacheable';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { IsNull, Not, Repository } from 'typeorm';
import { RoleEnum } from '@/apis/roles/roles.enum';
import { SuccessResponse } from '@/common/base/success-response';
import { AccessControlLists, Token } from '@/common/enums/auth.enum';
import { OAuthProvider } from '@/common/enums/oauth-provider.enum';
import { logger, MsgIds } from '@/common/logger/logger';
import { Result } from '@/common/types/auth.dto';
import { ICacheService } from '@/module/cache/cache.interface';
import { AppConfig, JWTConfig } from '@/module/configs/interfaces/config.interface';
import { IJwtService } from '@/module/jwt/jwt.interface';
import { UserEntity } from '../user/entities/user.entity';
import { IUserService } from '../user/interface/user.interface';
import { IAuthService } from './auth.interface';
import { AuthTokens, ChangePasswordDto, LoginDTO, OauthProfileDto, RegisterDTO } from './dto/auth.dto';
import { OAuthAccountEntity } from './entities/oauth-account.entity';
import { UserSessionEntity } from './entities/user-session.entity';
import { FacebookTokenVerifier } from './facebook-token.verifier';
import { GoogleTokenVerifier } from './google-token.verifier';

type JtiTokens = AuthTokens & {
  accessJti: string;
  refreshJti: string;
};

type AuthTokenSession = {
  expirationTime: number;
  refreshTime: number;
  sameSite: AppConfig['cookie']['sameSite'];
  maxAge: number;
  deviceName?: string;
};

type PersistUserSessionParams = {
  userId: string;
  accessJti: string;
  refreshJti: string;
  refreshTime: number;
  deviceName?: string;
  previousRefreshJti?: string;
};

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(IJwtService) private readonly jwtService: IJwtService,
    private readonly configService: ConfigService,
    @Inject(ICacheService) private readonly cacheService: ICacheService,
    @Inject(IUserService) private readonly userService: IUserService,
    @InjectRepository(OAuthAccountEntity) private readonly oauthAccountRepo: Repository<OAuthAccountEntity>,
    @InjectRepository(UserSessionEntity) private readonly userSessionRepo: Repository<UserSessionEntity>,
    private readonly googleTokenVerifier: GoogleTokenVerifier,
    private readonly facebookTokenVerifier: FacebookTokenVerifier,
    private readonly i18n: I18nService
  ) {}

  async login(loginUserDto: LoginDTO, response: Response, deviceName?: string): Promise<SuccessResponse<AuthTokens>> {
    const {
      jwt: { expirationTime, refreshTime },
      cookie: { sameSite, maxAge },
    } = this.configService.getOrThrow<AppConfig>('app');

    const { email, password } = loginUserDto;

    const user = await this.userService.validateUserByEmailPassword(email, password);
    return this.generateToken(user, response, { expirationTime, refreshTime, sameSite, maxAge, deviceName });
  }

  async loginWithGoogle(
    profile: OauthProfileDto,
    response: Response,
    deviceName?: string
  ): Promise<SuccessResponse<AuthTokens>> {
    return this.loginWithOauth(OAuthProvider.GOOGLE, profile, response, deviceName);
  }

  async loginWithGoogleIdToken(
    idToken: string,
    response: Response,
    deviceName?: string
  ): Promise<SuccessResponse<AuthTokens>> {
    const profile = await this.googleTokenVerifier.verify(idToken);
    return this.loginWithGoogle(profile, response, deviceName);
  }

  async loginWithFacebook(
    profile: OauthProfileDto,
    response: Response,
    deviceName?: string
  ): Promise<SuccessResponse<AuthTokens>> {
    return this.loginWithOauth(OAuthProvider.FACEBOOK, profile, response, deviceName);
  }

  async loginWithFacebookAccessToken(
    accessToken: string,
    response: Response,
    deviceName?: string
  ): Promise<SuccessResponse<AuthTokens>> {
    const profile = await this.facebookTokenVerifier.verify(accessToken);
    return this.loginWithFacebook(profile, response, deviceName);
  }

  async register(registerDto: RegisterDTO): Promise<SuccessResponse<Result>> {
    // Check if user already exists
    const user = await this.userService.getOne({ where: { email: registerDto.email } });

    // If user already exists, throw conflict exception
    if (user) throw new ConflictException(this.i18n.t('auth.conflict_user'));

    // Create new user
    await this.userService.create({
      email: registerDto.email,
      password: registerDto.password,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      role: {
        name: RoleEnum.USER,
      },
    });

    return new SuccessResponse({
      data: {
        success: true,
      },
      message: await this.i18n.t('auth.register_success'),
    });
  }

  private async loginWithOauth(
    provider: OAuthProvider,
    profile: OauthProfileDto,
    response: Response,
    deviceName?: string
  ): Promise<SuccessResponse<AuthTokens>> {
    const {
      jwt: { expirationTime, refreshTime },
      cookie: { sameSite, maxAge },
    } = this.configService.getOrThrow<AppConfig>('app');

    const user = await this.findOrCreateOauthUser(provider, profile);
    const result = await this.generateToken(user, response, {
      expirationTime,
      refreshTime,
      sameSite,
      maxAge,
      deviceName,
    });
    this.logger.log(`OAuth ${provider} login ok email=${user.email} avatarUrl=${user.avatarUrl ?? 'null'}`);
    return result;
  }

  private async findOrCreateOauthUser(provider: OAuthProvider, profile: OauthProfileDto): Promise<UserEntity> {
    const existingOauth = await this.oauthAccountRepo.findOne({
      where: { provider, providerAccountId: profile.providerAccountId },
      relations: { user: { role: true } },
    });

    let user = existingOauth?.user ?? (await this.userService.getOne({ where: { email: profile.email } }));
    if (!user) {
      user = await this.userService.create({
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
        password: null,
        role: { name: RoleEnum.USER },
      });
    }

    if (!existingOauth) {
      await this.oauthAccountRepo.save({
        userId: user.id,
        provider,
        providerAccountId: profile.providerAccountId,
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
        idToken: profile.idToken,
        tokenType: 'Bearer',
      });
    }

    if (profile.avatarUrl && profile.avatarUrl !== user.avatarUrl) {
      await this.oauthAccountRepo.manager.update(UserEntity, { id: user.id }, { avatarUrl: profile.avatarUrl });
      user.avatarUrl = profile.avatarUrl;
    }

    return user;
  }

  private async generateToken(
    user: UserEntity,
    response: Response,
    session: AuthTokenSession
  ): Promise<SuccessResponse<AuthTokens>> {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      fisrtName: user.firstName,
      lastName: user.lastName,
      role: user.role?.name ?? RoleEnum.USER,
    };

    const { accessToken, refreshToken, accessJti, refreshJti } = await this.signJwtPair(payload);
    logger.write(MsgIds.M005001);
    this.logger.log(logger.getMessage(MsgIds.M005001));

    this.cacheService.setMany([
      {
        key: `${AccessControlLists.WHITE}:${Token.ACCESS}:${accessJti}`,
        value: accessToken,
        ttl: session.expirationTime * 1000,
      },
      {
        key: `${AccessControlLists.WHITE}:${Token.REFRESH}:${refreshJti}`,
        value: refreshToken,
        ttl: session.refreshTime * 1000,
      },
    ]);

    await this.persistUserSession({
      userId: user.id,
      accessJti,
      refreshJti,
      refreshTime: session.refreshTime,
      deviceName: session.deviceName,
    });

    response.cookie(Token.REFRESH, refreshToken, {
      httpOnly: true,
      sameSite: session.sameSite,
      maxAge: session.maxAge,
    });

    logger.write(MsgIds.M005002);
    this.logger.log(logger.getMessage(MsgIds.M005002));

    return new SuccessResponse({
      data: { accessToken, refreshToken },
      message: await this.i18n.t('auth.login_success'),
    });
  }

  private async signJwtPair(payload: JwtPayload): Promise<JtiTokens> {
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

  async refreshToken(
    authTokens: AuthTokens,
    response: Response,
    deviceName?: string
  ): Promise<SuccessResponse<AuthTokens>> {
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
      throw new UnauthorizedException(await this.i18n.t('auth.access_denied'));
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
      role: user.role?.name ?? RoleEnum.USER,
    };

    const { accessToken, refreshToken, accessJti, refreshJti } = await this.signJwtPair(payload);

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

    await this.persistUserSession({
      userId: user.id,
      accessJti,
      refreshJti,
      refreshTime,
      deviceName,
      previousRefreshJti: refreshPayload.jti,
    });

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
      throw new UnauthorizedException(await this.i18n.t('auth.access_denied'));
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

    if (refreshPayload.jti) {
      await this.userSessionRepo.update(
        { refreshJti: refreshPayload.jti, revokedAt: IsNull() },
        { revokedAt: new Date() }
      );
    }

    return new SuccessResponse({
      data: { success: true },
      message: await this.i18n.t('auth.logout_success'),
    });
  }

  async changePassword(
    userId: string,
    accessJti: string | undefined,
    dto: ChangePasswordDto
  ): Promise<SuccessResponse<Result>> {
    const user = await this.userService.getOne({ where: { id: userId } });
    if (!user?.password) {
      throw new UnauthorizedException(await this.i18n.t('auth.invalid_password'));
    }

    const matches = await verify(user.password, dto.currentPassword);
    if (!matches) {
      throw new UnauthorizedException(await this.i18n.t('auth.invalid_password'));
    }

    await this.userService.updateUserById(userId, { password: dto.newPassword });

    if (dto.logoutAll) {
      await this.revokeOtherSessions(userId, accessJti);
    }

    return new SuccessResponse({
      data: { success: true },
      message: await this.i18n.t('auth.change_password_success'),
    });
  }

  private async persistUserSession(params: PersistUserSessionParams): Promise<void> {
    const expiresAt = new Date(Date.now() + params.refreshTime * 1000);
    const deviceName = params.deviceName?.slice(0, 255) || null;

    if (params.previousRefreshJti) {
      const updated = await this.userSessionRepo.update(
        { refreshJti: params.previousRefreshJti, revokedAt: IsNull() },
        {
          accessJti: params.accessJti,
          refreshJti: params.refreshJti,
          expiresAt,
          ...(deviceName ? { deviceName } : {}),
        }
      );
      if (updated.affected) return;
    }

    await this.userSessionRepo.save({
      userId: params.userId,
      accessJti: params.accessJti,
      refreshJti: params.refreshJti,
      deviceName,
      expiresAt,
    });
  }

  private async revokeOtherSessions(userId: string, accessJti?: string): Promise<void> {
    const where = {
      userId,
      revokedAt: IsNull(),
      ...(accessJti ? { accessJti: Not(accessJti) } : {}),
    };
    const others = await this.userSessionRepo.find({ where });
    if (!others.length) return;

    await this.userSessionRepo.update(where, { revokedAt: new Date() });

    const whitelistKeys = others.flatMap((session) => [
      `${AccessControlLists.WHITE}:${Token.ACCESS}:${session.accessJti}`,
      `${AccessControlLists.WHITE}:${Token.REFRESH}:${session.refreshJti}`,
    ]);
    const blacklistTtl = 7 * 24 * 60 * 60 * 1000;
    const blacklist = others.flatMap((session) => [
      {
        key: `${AccessControlLists.BLACK}:${Token.ACCESS}:${session.accessJti}`,
        value: 'revoked',
        ttl: blacklistTtl,
      },
      {
        key: `${AccessControlLists.BLACK}:${Token.REFRESH}:${session.refreshJti}`,
        value: 'revoked',
        ttl: blacklistTtl,
      },
    ]);

    this.cacheService.deleteMany(whitelistKeys);
    this.cacheService.setMany(blacklist);
  }
}
