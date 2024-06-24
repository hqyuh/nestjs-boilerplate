import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database.module';
import { PermissionSeedModule } from './permission/permission-seed.module';
import { RoleSeedModule } from './role/role-seed.module';
import { UserSeedModule } from './user/user-seed.module';

@Module({
	imports: [
		PermissionSeedModule,
		UserSeedModule,
		RoleSeedModule,
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ['.env']
		}),
		DatabaseModule
	]
})
export class SeedModule {}
