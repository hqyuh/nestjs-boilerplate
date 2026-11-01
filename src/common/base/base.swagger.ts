import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExcludeController,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger';
import { FilterOperator, FilterSuffix, PaginateConfig } from 'nestjs-paginate';

const TIMESTAMP = '2026-11-01T15:00:00.000Z';

export const getBaseProperties = (
  status: number,
  method = 'GET',
  path = '/api/v1/user'
): Record<string, SchemaObject | ReferenceObject> => {
  return {
    status: { type: 'number', example: status },
    message: { type: 'string', example: 'ok' },
    path: { type: 'string', example: path },
    method: { type: 'string', example: method },
    timestamp: { type: 'string', example: TIMESTAMP },
  };
};

export const getErrorSchema = (
  statusCode: number,
  message: string,
  method = 'GET',
  path = '/api/v1/user'
): SchemaObject => ({
  type: 'object',
  properties: {
    statusCode: { type: 'number', example: statusCode },
    message: { type: 'string', example: message },
    detail: { nullable: true },
    timestamp: { type: 'string', example: TIMESTAMP },
    path: { type: 'string', example: path },
    method: { type: 'string', example: method },
  },
});

export const getPaginationProperties = (): Record<string, SchemaObject | ReferenceObject> => {
  return {
    pagination: {
      properties: {
        page: { example: 2 },
        limit: { example: 10 },
        totalItems: { example: 45 },
        totalPages: { example: 5 },
      },
    },
    links: {
      properties: {
        first: { example: '/api/v1/user?page=1&limit=10' },
        previous: { example: '/api/v1/user?page=1&limit=10' },
        current: { example: '/api/v1/user?page=2&limit=10' },
        next: { example: '/api/v1/user?page=3&limit=10' },
        last: { example: '/api/v1/user?page=5&limit=10' },
      },
    },
  };
};

export const getBaseSchema = (
  $ref: any,
  status = 200,
  method = 'GET',
  path = '/api/v1/user'
): SchemaObject & Partial<ReferenceObject> => {
  return {
    type: 'object',
    properties: {
      ...getBaseProperties(status, method, path),
      data: { $ref: getSchemaPath($ref) },
    },
  };
};

export const getPaginationSchema = ($ref: any, status = 200): SchemaObject & Partial<ReferenceObject> => {
  const path = '/api/v1/user?page=2&limit=10';
  return {
    type: 'object',
    properties: {
      ...getBaseProperties(status, 'GET', path),
      data: {
        type: 'array',
        items: {
          $ref: getSchemaPath($ref),
        },
      },
      ...getPaginationProperties(),
    },
  };
};

/**
 * Swagger for create API
 * @param $ref Class Schema
 * @param name Schema name
 * @example ApiCreate(User, 'user')
 */
export const ApiCreate = ($ref: any, name: string) =>
  applyDecorators(
    ApiExtraModels($ref),
    ApiOperation({ summary: 'Create a new ' + name }),
    ApiCreatedResponse({
      description: 'Create a new ' + name + ' successfully',
      schema: getBaseSchema($ref, 201, 'POST', '/api/v1/user'),
    }),
    ApiBadRequestResponse({
      description: 'Incorrect type or missing data in the request body',
      schema: getErrorSchema(400, 'Bad Request', 'POST', '/api/v1/user'),
    }),
    ApiUnauthorizedResponse({ schema: getErrorSchema(401, 'Unauthorized', 'POST', '/api/v1/user') }),
    ApiForbiddenResponse({ schema: getErrorSchema(403, 'Forbidden', 'POST', '/api/v1/user') }),
    ApiNotFoundResponse({
      description: 'Role not found',
      schema: getErrorSchema(404, 'Role not found', 'POST', '/api/v1/user'),
    }),
    ApiConflictResponse({
      description: 'Duplicate data (already created)',
      schema: getErrorSchema(409, 'User already exist', 'POST', '/api/v1/user'),
    })
  );

/**
 * Swagger for get all API
 * @param $ref Class Schema
 * @param name Schema name
 * @example ApiGetAll(User, 'user')
 */
const ApiPaginateQuery = (config: PaginateConfig<any>) =>
  applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Page number. Default: 1',
      schema: { type: 'integer', example: 1 },
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      description: `Items per page. Default: ${config.defaultLimit ?? 10}. Min: 1. Max: ${config.maxLimit ?? 100}`,
      schema: { type: 'integer', example: config.defaultLimit ?? 10, maximum: config.maxLimit ?? 100 },
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      description: `Format: field:ASC or field:DESC. ${config.sortableColumns.join(', ')}`,
      schema: {
        type: 'string',
        example: config.defaultSortBy?.map(([field, dir]) => `${field}:${dir}`).join(','),
      },
    }),
    ApiQuery({
      name: 'select',
      required: false,
      description: `Columns to return. Default: all. ${(config.select ?? config.sortableColumns).join(', ')}`,
      schema: { type: 'string' },
    }),
    ApiQuery({
      name: 'filter',
      required: false,
      description: [
        'Example: field=$eq:value',
        'Two fields: a=$eq:x AND b=$eq:y',
        'Or filter.a=$eq:x&filter.b=$eq:y',
        Object.keys(config.filterableColumns ?? {}).join(', '),
        `Operators: ${[...Object.values(FilterOperator), FilterSuffix.NOT].map((op) => `\`${op}\``).join(', ')}`,
      ].join('\n\n'),
    })
  );

export const ApiGetAll = ($ref: any, name: string, paginateConfig?: PaginateConfig<any>) =>
  applyDecorators(
    ApiExtraModels($ref),
    ApiOperation({ summary: 'Get a list of ' + name }),
    ApiOkResponse({
      description: 'Get a list of ' + name + ' successfully',
      schema: getPaginationSchema($ref),
    }),
    ApiBadRequestResponse({
      description: 'Invalid filter or query',
      schema: getErrorSchema(400, "Column 'firstName1' is not filterable", 'GET', '/api/v1/user'),
    }),
    ApiUnauthorizedResponse({ schema: getErrorSchema(401, 'Unauthorized', 'GET', '/api/v1/user') }),
    ApiForbiddenResponse({ schema: getErrorSchema(403, 'Forbidden', 'GET', '/api/v1/user') }),
    ...(paginateConfig ? [ApiPaginateQuery(paginateConfig)] : [])
  );

/**
 * Swagger for get one API
 * @param $ref Class Schema
 * @param name Schema name
 * @example ApiGetOne(User, 'user')
 */
export const ApiGetOne = ($ref: any, name: string) =>
  applyDecorators(
    ApiExtraModels($ref),
    ApiOperation({ summary: 'Get details of a ' + name }),
    ApiOkResponse({
      description: 'Get details of a ' + name + ' successfully',
      schema: getBaseSchema($ref, 200, 'GET', '/api/v1/user/{id}'),
    }),
    ApiUnauthorizedResponse({ schema: getErrorSchema(401, 'Unauthorized', 'GET', '/api/v1/user/{id}') }),
    ApiForbiddenResponse({ schema: getErrorSchema(403, 'Forbidden', 'GET', '/api/v1/user/{id}') }),
    ApiNotFoundResponse({
      description: name + ' not found',
      schema: getErrorSchema(404, name + ' not found', 'GET', '/api/v1/user/{id}'),
    })
  );

/**
 * Swagger for update API
 * @param $ref Class Schema
 * @param name Schema name
 * @example ApiUpdate(User, 'user')
 */
export const ApiUpdate = ($ref: any, name: string) =>
  applyDecorators(
    ApiExtraModels($ref),
    ApiOperation({ summary: 'Update a ' + name }),
    ApiOkResponse({
      description: 'Update a ' + name + ' successfully',
      schema: getBaseSchema($ref, 200, 'PATCH', '/api/v1/user/{id}'),
    }),
    ApiBadRequestResponse({
      description: 'Incorrect type or missing data in the request body',
      schema: getErrorSchema(400, 'Bad Request', 'PATCH', '/api/v1/user/{id}'),
    }),
    ApiUnauthorizedResponse({ schema: getErrorSchema(401, 'Unauthorized', 'PATCH', '/api/v1/user/{id}') }),
    ApiForbiddenResponse({ schema: getErrorSchema(403, 'Forbidden', 'PATCH', '/api/v1/user/{id}') }),
    ApiNotFoundResponse({
      description: name + ' not found',
      schema: getErrorSchema(404, name + ' not found', 'PATCH', '/api/v1/user/{id}'),
    })
  );

/**
 * Swagger for delete API
 * @param $ref Class Schema
 * @param name Schema name
 * @example ApiDelete(User, 'user')
 */
export const ApiDelete = ($ref: any, name: string) =>
  applyDecorators(
    ApiExtraModels($ref),
    ApiOperation({ summary: 'Delete a ' + name }),
    ApiOkResponse({
      description: 'Delete a ' + name + ' successfully',
      schema: getBaseSchema($ref, 200, 'DELETE', '/api/v1/user/{id}'),
    }),
    ApiUnauthorizedResponse({ schema: getErrorSchema(401, 'Unauthorized', 'DELETE', '/api/v1/user/{id}') }),
    ApiForbiddenResponse({ schema: getErrorSchema(403, 'Forbidden', 'DELETE', '/api/v1/user/{id}') }),
    ApiNotFoundResponse({
      description: name + ' not found',
      schema: getErrorSchema(404, name + ' not found', 'DELETE', '/api/v1/user/{id}'),
    })
  );

/**
 * Swagger to hide controller on production
 * @example ApiHideController()
 */
export const ApiHideController = () => applyDecorators(ApiExcludeController(process.env.NODE_ENV === 'production'));

/**
 * Swagger for controller
 * @example ApiController()
 */
export const ApiController = (name: string) => applyDecorators(ApiHideController(), ApiTags(`${name} API`));
