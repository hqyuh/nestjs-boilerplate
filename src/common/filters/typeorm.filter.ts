import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { TypeORMError } from 'typeorm';

import { IResponseError } from '../exceptions/global.response.error';

@Catch(TypeORMError)
export class TypeOrmFilter implements ExceptionFilter {
  private readonly logger = new Logger('TypeORMError');

  catch(exception: TypeORMError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const request = host.switchToHttp().getRequest();

    const customResponse = {
      statusCode: 500,
      message: 'Internal Server Error (ORM)',
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    } satisfies IResponseError;

    this.logger.error(exception.message);
    this.logger.error(JSON.stringify(exception));
    response.status(customResponse.statusCode).json(customResponse);
  }
}
