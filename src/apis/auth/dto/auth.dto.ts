import { IsEmail, IsNotEmpty, IsString } from '@/common/decorator/validation.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { MaxLength, MinLength } from 'class-validator';

export class LoginDTO {
  /** Email */
  @ApiProperty({ description: 'Email' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  /** Password */
  @ApiProperty({ description: 'Password' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RegisterDTO {
  /** Email */
  @ApiProperty({ description: 'Email' })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(50)
  @IsEmail()
  email: string;

  /** Password */
  @ApiProperty({ description: 'Password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  // @IsStrongPassword()
  password: string;

  /** Firt Name */
  @ApiProperty({ description: 'Firt Name' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  firstName: string;

  /** Last Name */
  @ApiProperty({ description: 'Last Name' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  lastName: string;
}

export class AuthTokens {
  @ApiProperty({ description: 'Access Token' })
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiProperty({ description: 'Refresh Token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
