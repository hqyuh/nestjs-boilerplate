import { IsNotEmpty, IsString } from '@/common/decorator/validation.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
	@ApiProperty({ description: 'Refresh Token' })
	@IsString()
	@IsNotEmpty()
	refreshToken: string;
}

export class TokenDto extends RefreshTokenDto {
	accessToken: string;
}
