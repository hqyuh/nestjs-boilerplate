import { UserModule } from '@/apis/user/user.module';
import { CacheModule } from '@/module/cache/cache.module';
import { JwtModule } from '@/module/jwt/jwt.module';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { IAuthService } from './auth.interface';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/jwt/refresh-jwt.strategy';
import { UserLocalStrategy } from './strategies/local/user.local.strategy';
@Module({
	imports: [PassportModule, UserModule, CacheModule, JwtModule],
	controllers: [AuthController],
	providers: [
		{
			provide: IAuthService,
			useClass: AuthService
		},
		UserLocalStrategy,
		JwtStrategy,
		RefreshJwtStrategy
	]
})
export class AuthModule {}
