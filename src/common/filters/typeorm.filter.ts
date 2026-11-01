import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { TypeORMError } from 'typeorm';

import { IResponseError } from '../exceptions/global.response.error';

@Catch(TypeORMError)
export class TypeOrmFilter implements ExceptionFilter {
  private readonly logger = new Logger('TypeORMError');

  catch(exception: TypeORMError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const request = host.switchToHttp().getRequest();
    this.logger.error(exception.message);
    response.status(500).json({
      statusCode: 500,
      message: 'Internal Server Error (ORM)',
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    } satisfies IResponseError);
  }
}
