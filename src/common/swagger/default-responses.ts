import { OpenAPIObject } from '@nestjs/swagger';

const METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const;
const TIMESTAMP = '2026-11-01T15:00:00.000Z';

const errorExample = (statusCode: number, message: string, method: string, path: string) => ({
  statusCode,
  message,
  timestamp: TIMESTAMP,
  path,
  method: method.toUpperCase(),
});

const successExample = (status: number, method: string, path: string) => ({
  status,
  data: {},
  message: 'ok',
  path,
  method: method.toUpperCase(),
  timestamp: TIMESTAMP,
});

const errorContent = (statusCode: number, message: string, method: string, path: string) => ({
  description: message,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
      example: errorExample(statusCode, message, method, path),
    },
  },
});

function isResponseObject(value: unknown): value is { description?: string; content?: unknown } {
  return !!value && typeof value === 'object' && !('$ref' in value);
}

export function addDefaultResponses(document: OpenAPIObject): OpenAPIObject {
  document.components = {
    ...document.components,
    schemas: {
      ...document.components?.schemas,
      ErrorResponse: {
        type: 'object',
        properties: {
          statusCode: { type: 'integer', example: 400 },
          message: { type: 'string', example: 'Bad Request' },
          detail: { type: 'object' },
          timestamp: { type: 'string', example: TIMESTAMP },
          path: { type: 'string', example: '/api/v1/user' },
          method: { type: 'string', example: 'GET' },
        },
      },
    },
  };

  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    if (!pathItem) continue;
    for (const method of METHODS) {
      const operation = pathItem[method];
      if (!operation || typeof operation !== 'object' || !('responses' in operation) || !operation.responses) continue;

      const responses = operation.responses;
      const httpMethod = method.toUpperCase();

      for (const [code, response] of Object.entries(responses)) {
        if (!isResponseObject(response) || response.content) continue;
        if (code === '200' || code === '201') {
          response.content = {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'number', example: Number(code) },
                  message: { type: 'string', example: 'ok' },
                  data: { type: 'object' },
                  path: { type: 'string', example: path },
                  method: { type: 'string', example: httpMethod },
                  timestamp: { type: 'string', example: TIMESTAMP },
                },
              },
              example: successExample(Number(code), method, path),
            },
          };
          continue;
        }
        if (/^[45]\d\d$/.test(code)) {
          response.content = errorContent(Number(code), response.description || 'Error', method, path).content;
        }
      }

      if (!responses['500']) {
        responses['500'] = errorContent(500, 'Internal Server Error', method, path);
      }
      if (operation.security?.length && !responses['401']) {
        responses['401'] = errorContent(401, 'Unauthorized', method, path);
      }
    }
  }

  return document;
}
