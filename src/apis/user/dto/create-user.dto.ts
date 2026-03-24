import { IsNotEmpty, IsString } from '@/common/decorator/validation.decorator';
import { lowerCaseTransformer } from '@/common/utils/transformer/upper-lower-case.transformer';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsUUID } from 'class-validator';

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

  @ApiProperty({ description: 'Role Id' })
  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}
