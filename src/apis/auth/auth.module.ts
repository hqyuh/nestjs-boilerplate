import { UserModule } from '@/apis/user/user.module';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { IAuthService } from './auth.interface';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt/jwt.strategy';
import { UserLocalStrategy } from './strategies/local/user.local.strategy';
import { CacheModule } from '@/module/cache/cache.module';
import { RefreshJwtStrategy } from './strategies/jwt/refresh-jwt.strategy';
import { JwtModule } from '@/module/jwt/jwt.module';
import { AuthValidationMiddleware } from '@/common/middlewares/auth.validation.middleware';
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
export class AuthModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(AuthValidationMiddleware)
			.forRoutes({ path: '/v1/auth/user/login', method: RequestMethod.POST });
	}
}
