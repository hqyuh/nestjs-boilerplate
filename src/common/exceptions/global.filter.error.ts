import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	ForbiddenException,
	HttpException,
	HttpStatus,
	Logger,
	UnauthorizedException
} from '@nestjs/common';
import { CannotCreateEntityIdMapError, EntityNotFoundError, QueryFailedError } from 'typeorm';
import { GlobalResponseError } from './global.response.error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	logger = new Logger(GlobalExceptionFilter.name);
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		const request = ctx.getRequest();

		let status = HttpStatus.BAD_REQUEST;
		let message = 'HttpException';

		this.logger.error(exception);

		if (exception instanceof ForbiddenException) {
			status = exception.getStatus();
			message = exception.message;
			this.logger.debug(exception);
		} else if (exception instanceof UnauthorizedException) {
			status = exception.getStatus();
			message = exception.message;
		} else if (exception instanceof HttpException) {
			status = exception.getStatus();
			message = (exception as any).response.errors;
		} else if (
			exception instanceof QueryFailedError ||
			exception instanceof EntityNotFoundError ||
			exception instanceof CannotCreateEntityIdMapError
		) {
			status = HttpStatus.UNPROCESSABLE_ENTITY;
			message = (exception as Error).message || 'QueryFailedError';
		}
		// Send the response with the appropriate status and message
		response.status(status).json(GlobalResponseError(status, message, request));
	}
}
