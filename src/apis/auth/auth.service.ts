import { UserEntity } from '@/apis/user/entities/user.entity';
import { ICacheService } from '@/module/cache/cache.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAuthService } from './auth.interface';
import { IJwtService } from '@/module/jwt/jwt.interface';
import { RefreshTokenDto, TokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService extends IAuthService {
  constructor(
    private readonly jwtService: IJwtService,
    private readonly configService: ConfigService,
    private readonly cacheService: ICacheService
  ) {
    super();
  }

  async createToken(user: UserEntity) {
    const payload: JwtPayload = {
      id: user.id,
    };

    const { accessToken, refreshToken } = await this.generateToken(payload);
    return { user, accessToken, refreshToken };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const data = await this.jwtService.verify(refreshTokenDto.refreshToken);

    const isCheckBlackListedRefreshToken = await this.cacheService.get(refreshTokenDto.refreshToken);

    if (isCheckBlackListedRefreshToken) {
      // TODO: handle show error message
      throw new UnauthorizedException('access_denied');
    }

    // renew token
    const payload: JwtPayload = {
      id: data.id,
    };

    return await this.generateToken(payload);
  }

  private async generateToken(payload: JwtPayload): Promise<TokenDto> {
    const expiresInAccessToken = this.configService.get<string>('JWT_EXPIRATION_TIME');
    const expiresInRefreshToken = this.configService.get<string>('JWT_REFRESH_TOKEN_TIME');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(payload, {
        expiresIn: expiresInAccessToken,
      }),
      this.jwtService.sign(payload, {
        expiresIn: expiresInRefreshToken,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async logout(refreshTokenDto: RefreshTokenDto) {
    const data = await this.jwtService.verify(refreshTokenDto.refreshToken);

    const currentTime = Math.floor(Date.now() / 1000);
    const refreshToken = refreshTokenDto.refreshToken;

    const expiredTime = data.exp - currentTime;

    await this.cacheService.set(refreshToken, refreshToken, expiredTime);

    // TODO: handle show response logout
    return {};
  }
}
