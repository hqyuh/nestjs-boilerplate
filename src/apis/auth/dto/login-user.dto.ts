import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  /** Login username */
  @ApiProperty({ description: 'Login username' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  /** Password */
  @ApiProperty({ description: 'Password' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
