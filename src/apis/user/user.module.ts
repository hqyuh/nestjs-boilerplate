import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserController } from './user.controller';
import { IUserService } from './user.interface';
import { UserService } from './user.service';
import { CacheModule } from '@/module/cache/cache.module';
import { AbilityModule } from '@/module/ability/ability.module';
// import { AbilityModule } from '@/module/ability/ability.module';

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity]), CacheModule, AbilityModule],
	controllers: [UserController],
	providers: [
		{
			provide: IUserService,
			useClass: UserService
		}
	],
	exports: [IUserService]
})
export class UserModule {}
