import { PermissionSeedService } from './permission-seed.service';
import { Permission } from '@/apis/permissions/entities/permission.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionSeedService } from './permission-seed.service';
import { Permission } from '@/apis/permissions/entities/permission.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionSeedService } from './permission-seed.service';
import { Permission } from '@/apis/permissions/entities/permission.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionSeedService } from './permission-seed.service';
import { Permission } from '@/apis/permissions/entities/permission.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionSeedService } from './permission-seed.service';
import { Permission } from '@/apis/permissions/entities/permission.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  providers: [PermissionSeedService],
  exports: [PermissionSeedService],
})
export class PermissionSeedModule {}
