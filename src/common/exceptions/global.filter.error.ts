import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

import { GlobalResponseError } from './global.response.error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  logger = new Logger(GlobalExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    this.logger.error(exception);

    // Default response for untrusted exceptions
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let detail = undefined;

    // Handle trusted exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
      detail = exception.cause;
    }

    // Send the response with the appropriate status and message
    response.status(status).json(GlobalResponseError(status, message, detail, request));
  }
}
