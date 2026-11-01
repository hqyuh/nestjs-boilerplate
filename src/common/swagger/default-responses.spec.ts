import { OpenAPIObject } from '@nestjs/swagger';
import { describe, expect, it } from 'vitest';

import { addDefaultResponses } from './default-responses';

describe('addDefaultResponses', () => {
  it('keeps existing success status and does not invent 201 on GET', () => {
    const document = addDefaultResponses({
      openapi: '3.1.0',
      info: { title: 'api', version: '1' },
      paths: {
        '/api/v1/user': {
          get: {
            responses: {
              '200': { description: 'Get a list of User successfully' },
            },
          },
        },
      },
    } as OpenAPIObject);

    const responses = document.paths['/api/v1/user']?.get?.responses ?? {};
    expect(responses['201']).toBeUndefined();
    expect(responses['404']).toBeUndefined();
    expect(responses['200']).toMatchObject({
      description: 'Get a list of User successfully',
      content: {
        'application/json': {
          example: {
            status: 200,
            message: 'ok',
            path: '/api/v1/user',
            method: 'GET',
          },
        },
      },
    });
    expect(responses['500']).toMatchObject({
      description: 'Internal Server Error',
    });
  });

  it('adds 401 when the operation requires auth', () => {
    const document = addDefaultResponses({
      openapi: '3.1.0',
      info: { title: 'api', version: '1' },
      paths: {
        '/api/v1/user': {
          get: {
            security: [{ accessToken: [] }],
            responses: { '200': { description: 'OK' } },
          },
        },
      },
    } as OpenAPIObject);

    expect(document.paths['/api/v1/user']?.get?.responses?.['401']).toMatchObject({
      description: 'Unauthorized',
    });
  });
});
