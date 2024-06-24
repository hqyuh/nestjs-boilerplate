import { IsNotEmpty, IsString } from '@/common/decorator/validation.decorator';
import { ApiProperty } from '@nestjs/swagger';

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
