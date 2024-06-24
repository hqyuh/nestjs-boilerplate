import { IsNotEmpty, IsString } from '@/common/decorator/validation.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
	@ApiProperty({ description: 'Login username' })
	@IsString()
	@IsNotEmpty()
	username!: string;

	@ApiProperty({ description: 'Login password' })
	@IsString()
	@IsNotEmpty()
	password!: string;
}
