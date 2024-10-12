import { ApiProperty } from '@nestjs/swagger';

export class UsersDTO {
	@ApiProperty({
		description: 'Login account username',
		example: 'user123'
	})
	username: string;

	@ApiProperty({
		description: 'First name of the user',
		example: 'John',
		required: false
	})
	firstName?: string | null;

	@ApiProperty({
		description: 'Last name of the user',
		example: 'Doe',
		required: false
	})
	lastName?: string | null;

	@ApiProperty({
		description: 'Activation status of the user',
		example: true
	})
	isActive: boolean;
}
