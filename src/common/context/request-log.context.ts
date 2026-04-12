import { ClsServiceManager } from 'nestjs-cls';

/** Request id from nestjs-cls (active during HTTP handlers after ClsMiddleware). */
export function getRequestLogId(): string | undefined {
  try {
    const cls = ClsServiceManager.getClsService();
    if (!cls.isActive()) return undefined;
    return cls.getId();
  } catch {
    return undefined;
  }
}
