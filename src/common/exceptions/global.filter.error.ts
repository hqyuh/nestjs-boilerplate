import { I18nTranslations } from '@/module/i18n/generated/i18n.generated';
import { ForbiddenError } from '@casl/ability';
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
import { I18nContext } from 'nestjs-i18n';
import { CannotCreateEntityIdMapError, EntityNotFoundError, QueryFailedError } from 'typeorm';
import { GlobalResponseError } from './global.response.error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private i18n: I18nContext<I18nTranslations>;

	logger = new Logger(GlobalExceptionFilter.name);
	catch(exception: unknown, host: ArgumentsHost) {
		console.log('🐔 =>  exception:', exception);
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		const request = ctx.getRequest();
		let message = ''; // Default message
		let code = '';
		let status = HttpStatus.INTERNAL_SERVER_ERROR;

		// Log the exception for debugging
		this.logger.error(exception);

		// Check for ForbiddenError (403)
		if (exception instanceof ForbiddenError || exception instanceof ForbiddenException) {
			status = HttpStatus.FORBIDDEN; // 403 Forbidden
			code = (exception as any).code || 'ForbiddenError';
			message = (exception as any).message;
		} else if (exception instanceof UnauthorizedException) {
			status = HttpStatus.UNAUTHORIZED; // 401 Unauthorized
			code = 'Unauthorized';
			message = (exception as any).message;
		}

		// Check for HttpException
		else if (exception instanceof HttpException) {
			console.log('instanceof HttpException');
			status = exception.getStatus(); // Get status from the exception

			message = (exception as any).response.errors;
			status = HttpStatus.BAD_REQUEST; // 400 Bad Request
			code = 'Bad Request';
		}

		// Handle specific TypeORM errors (422)
		else if (
			exception instanceof QueryFailedError ||
			exception instanceof EntityNotFoundError ||
			exception instanceof CannotCreateEntityIdMapError
		) {
			status = HttpStatus.UNPROCESSABLE_ENTITY; // 422 Unprocessable Entity
			message = (exception as Error).message;
			code = (exception as any).code || 'QueryFailedError';
		}

		// Log the final message and status
		console.log('🐔 => Final message:', message);
		console.log('🐔 => Final status:', status);

		// Send the response with the appropriate status and message
		response.status(status).json(GlobalResponseError(status, message, code, request));
	}
}
