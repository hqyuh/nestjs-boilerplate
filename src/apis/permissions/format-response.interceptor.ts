import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<IResponse<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const status = response.statusCode;

    const responseCommon = {
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };

    return next.handle().pipe(
      map((data) => {
        if (data.data && data.pagination) {
          return {
            status,
            message: data.message,
            data: data,
            pagination: data.pagination,
            ...responseCommon,
          };
        }

        return {
          status,
          message: data.message,
          data,
          ...responseCommon,
        };
      })
    );
  }
}
