import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm';
import { IsNumber } from '../decorator/validation.decorator';
import { BaseEntity } from './base.entity';

export class PaginationDto<T = BaseEntity> {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => +(value || 10))
  @ApiProperty({ description: 'Number of items per page', example: '10', type: 'string' })
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => +(value || 10))
  @ApiProperty({ description: 'Current page number', example: '1', type: 'string' })
  page?: number;

  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  @ApiProperty({
    description: 'Sort by field',
    example: '{ "createdAt": "ASC" }',
    type: 'string',
  })
  order?: FindOptionsOrder<T>;

  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  @ApiProperty({
    description: 'Filter by field',
    example: '{ "username": "hqh@example.com" }',
    type: 'string',
  })
  filter?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
}
