import { Injectable } from '@nestjs/common';
import { JwtSignOptions, JwtService as NestJwtService } from '@nestjs/jwt';
import { IJwtService } from './jwt.interface';

@Injectable()
export class JwtService extends IJwtService {
	private readonly JWT_SECRET: string;

	constructor(private readonly jwtService: NestJwtService) {
		super();
		this.JWT_SECRET = process.env.JWT_SECRET;
	}

	sign(payload: JwtPayload, options?: Omit<JwtSignOptions, 'secret'>) {
		return this.jwtService.signAsync(payload, {
			...options,
			secret: this.JWT_SECRET
		});
	}

	verify(token: string) {
		return this.jwtService.verifyAsync<JwtPayload>(token, {
			secret: this.JWT_SECRET
		});
	}
}
