import { type ArgumentsHost } from '@nestjs/common';
import { TypeORMError } from 'typeorm';
import { describe, expect, it, vi } from 'vitest';

import { TypeOrmFilter } from './typeorm.filter';

const host = (url = '/api/v1/user') => {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return {
    host: {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ url, method: 'GET' }),
      }),
    } as unknown as ArgumentsHost,
    status,
    json,
  };
};

describe('TypeOrmFilter', () => {
  it('returns 500 for TypeORM errors', () => {
    const { host: ctx, status, json } = host();

    new TypeOrmFilter().catch(new TypeORMError('connection lost'), ctx);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal Server Error (ORM)',
      })
    );
  });
});
