import { Request } from 'express';

export interface IResponseError {
  statusCode: number;
  message: string;
  detail?: Record<string, any>;
  timestamp: string;
  path: string;
  method: string;
}

export const GlobalResponseError: (
  statusCode: number,
  message: string,
  detail: Record<string, any> | undefined,
  request: Request
) => IResponseError = (
  statusCode: number,
  message: string,
  detail: Record<string, any>,
  request: Request
): IResponseError => {
  return {
    statusCode: statusCode,
    message,
    detail,
    timestamp: new Date().toISOString(),
    path: request.url,
    method: request.method,
  };
};
