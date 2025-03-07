import { IsNotEmpty, IsString } from '@/common/decorator/validation.decorator';
import { lowerCaseTransformer } from '@/common/utils/transformer/upper-lower-case.transformer';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Login username' })
  @IsString()
  @IsNotEmpty()
  @Transform(lowerCaseTransformer)
  username!: string;

  @ApiHideProperty()
  password!: string;

  @ApiProperty({ description: 'First name of user' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name of user' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Activation Status', default: false })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @ApiProperty({ description: 'Role Id', default: 1 })
  @IsInt()
  @IsNotEmpty()
  roleId: number;
}
