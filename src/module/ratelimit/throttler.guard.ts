import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
	async handleRequest(
		_context: ExecutionContext,
		_limit: number,
		_ttl: number
	): Promise<boolean> {
		// const { req, res } = this.getRequestResponse(context);
		// const ip = req.headers['x-forwarded-for'];
		return true;
	}
}
