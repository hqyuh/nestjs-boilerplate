import { getRequestLogId } from '@/common/context/request-log.context';
import { REQUEST_ID_HEADER } from '@/common/middlewares/request-id.constants';
import type { RequestWithRequestId } from '@/common/middlewares/correlation-id.middleware';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { isEmpty } from 'lodash';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');
  use(req: Request, res: Response, next: NextFunction) {
    const requestId =
      getRequestLogId() ?? (req as RequestWithRequestId).requestId ?? req.get(REQUEST_ID_HEADER) ?? undefined;
    const idPrefix = requestId ? `[${requestId}] ` : '';
    this.logger.verbose(`${idPrefix}--------------------------------------------------------------------`);
    const { method, body, query, headers } = req;
    const originalUrl = req.originalUrl.replace(/\?.*$/, '');
    const ip = headers['x-forwarded-for'];
    const host = headers['host'];
    const begin = Date.now();

    this.logger.verbose(`${idPrefix}[${method}] - ${host} - ${originalUrl} - ${ip}`);
    if (!isEmpty(query)) {
      this.logger.verbose(`${idPrefix}[query] - ${JSON.stringify(query)}`);
    }
    if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
      this.logger.verbose(`${idPrefix}[body] - ${JSON.stringify(body)}`);
    }

    // Log the response information
    res.on('finish', () => {
      const end = Date.now();
      let timeSpent = end - begin;
      let unitTime = 'ms';
      if (timeSpent >= 1000) {
        timeSpent = timeSpent / 1000;
        unitTime = 's';
      }
      const { statusCode, statusMessage } = res;
      const logMessage = `${idPrefix}[${statusCode}] - ${statusMessage} - ${timeSpent}${unitTime}`;
      if (statusCode === 200 || statusCode === 201) {
        this.logger.verbose(logMessage);
      } else {
        this.logger.error(logMessage);
      }
    });

    next();
  }
}
