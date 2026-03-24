import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
  UpdateDateColumn,
} from 'typeorm';

export class BaseUuidEntity extends BaseEntity {
  /** UUID */
  @ApiProperty({ description: 'Id' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Creation Date */
  @ApiProperty({ description: 'Creation Date' })
  @CreateDateColumn({ name: 'created_at', default: new Date() })
  createdAt: Date;

  /** Last Update Time */
  @ApiProperty({ description: 'Last Update Time' })
  @UpdateDateColumn({ name: 'updated_at', default: new Date() })
  updatedAt: Date;

  @ApiProperty({ description: 'Deletion Date' })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date | null;
}
