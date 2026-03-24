import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface CookieJwtPayload {
  accessToken?: string;
  refreshToken?: string;
}

export const CookieJwt = createParamDecorator((_data: never, ctx: ExecutionContext) => {
  const req: Request = ctx.switchToHttp().getRequest();

  const accessToken = req.headers.authorization?.split(' ')[1];
  const refreshToken = req.cookies['refresh-token'];

  return {
    accessToken,
    refreshToken,
  } as CookieJwtPayload;
});
