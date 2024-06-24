import { ApiProperty } from '@nestjs/swagger';
import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	PrimaryColumn,
	PrimaryGeneratedColumn,
	BaseEntity as TypeormBaseEntity,
	UpdateDateColumn
} from 'typeorm';

export class BaseEntity extends TypeormBaseEntity {
	/** UUID */
	@ApiProperty({ description: 'Id' })
	@PrimaryColumn()
	id: number;

	/** Creation Date */
	@ApiProperty({ description: 'Creation Date' })
	@CreateDateColumn({ default: new Date() })
	createdAt: Date;

	/** Last Update Time */
	@ApiProperty({ description: 'Last Update Time' })
	@CreateDateColumn({ default: new Date() })
	updatedAt: Date;

	/** Deletion Date */
	@ApiProperty({ description: 'Deletion Date' })
	@DeleteDateColumn()
	deletedAt?: Date | null;
}
