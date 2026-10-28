import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@/apis/user/user.module';
import { CacheModule } from '@/module/cache/cache.module';
import { JwtModule } from '@/module/jwt/jwt.module';

import { AuthController } from './auth.controller';
import { IAuthService } from './auth.interface';
import { AuthService } from './auth.service';
import { OAuthAccountEntity } from './entities/oauth-account.entity';
import { FacebookTokenVerifier } from './facebook-token.verifier';
import { GoogleTokenVerifier } from './google-token.verifier';
import { FacebookStrategy } from './strategies/facebook/facebook.strategy';
import { GoogleStrategy } from './strategies/google/google.strategy';
import { JwtStrategy } from './strategies/jwt/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/jwt/refresh-jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ session: false }),
    UserModule,
    CacheModule,
    JwtModule,
    TypeOrmModule.forFeature([OAuthAccountEntity]),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: IAuthService,
      useClass: AuthService,
    },
    GoogleTokenVerifier,
    FacebookTokenVerifier,
    JwtStrategy,
    RefreshJwtStrategy,
    GoogleStrategy,
    FacebookStrategy,
  ],
})
export class AuthModule {}
