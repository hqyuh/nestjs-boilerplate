import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

import { REQUEST_ID_HEADER } from './request-id.constants';

/** `req.get('x-request-id')` can be empty after internal header handling; keep id on the request object. */
export type RequestWithRequestId = Request & { requestId?: string };

const ALT_HEADER = 'x-correlation-id';

function firstHeaderValue(req: Request, name: string): string | undefined {
  const v = req.get(name);
  if (v == null) return undefined;
  const s = Array.isArray(v) ? v[0] : v;
  const t = typeof s === 'string' ? s.trim() : '';
  return t || undefined;
}

function resolveRequestId(req: Request): string {
  return firstHeaderValue(req, REQUEST_ID_HEADER) ?? firstHeaderValue(req, ALT_HEADER) ?? randomUUID();
}

/**
 * Runs first on Express so `x-request-id` exists before morgan and before Nest CLS reads it.
 */
export function ensureRequestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = resolveRequestId(req);
  (req as RequestWithRequestId).requestId = requestId;
  req.headers[REQUEST_ID_HEADER] = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);
  (res.locals as { requestId?: string }).requestId = requestId;
  next();
}

export function morganRequestIdToken(req: Request): string {
  const fromReq = (req as RequestWithRequestId).requestId;
  if (fromReq) return fromReq;
  const v = req.get(REQUEST_ID_HEADER);
  if (v == null || v === '') return '-';
  return Array.isArray(v) ? (v[0] ?? '-') : v;
}
