import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '@/apis/permissions/entities/permission.entity';
import { PermissionSeedService } from './permission-seed.service';

@Module({
	imports: [TypeOrmModule.forFeature([Permission])],
	providers: [PermissionSeedService],
	exports: [PermissionSeedService]
})
export class PermissionSeedModule {}
