import { applyDecorators } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiExcludeController,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	getSchemaPath
} from '@nestjs/swagger';
import {
	ReferenceObject,
	SchemaObject
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const getBaseProperties = (
	status: number
): Record<string, SchemaObject | ReferenceObject> => {
	return {
		status: { example: status },
		message: { example: 'success' }
	};
};

export const getPaginationProperties = (): Record<string, SchemaObject | ReferenceObject> => {
	return {
		pagination: {
			properties: {
				limit: { example: 10 },
				page: { example: 1 },
				total: { example: 10 }
			}
		}
	};
};

export const getBaseSchema = ($ref: any, status = 200): SchemaObject & Partial<ReferenceObject> => {
	return {
		properties: {
			...getBaseProperties(status),
			data: { $ref: getSchemaPath($ref) }
		}
	};
};

export const getPaginationSchema = (
	$ref: any,
	status = 200
): SchemaObject & Partial<ReferenceObject> => {
	return {
		properties: {
			...getBaseProperties(status),
			data: {
				type: 'array',
				items: {
					$ref: getSchemaPath($ref)
				}
			},
			...getPaginationProperties()
		}
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
		ApiOperation({ summary: 'Create a new ' + name }),
		ApiCreatedResponse({
			description: 'Create a new ' + name + ' successfully',
			schema: getBaseSchema($ref, 201)
		}),
		ApiBadRequestResponse({
			description: 'Incorrect type or missing data in the request body'
		}),
		ApiConflictResponse({ description: 'Duplicate data (already created)' })
	);

/**
 * Swagger for get all API
 * @param $ref Class Schema
 * @param name Schema name
 * @example ApiGetAll(User, 'user')
 */
export const ApiGetAll = ($ref: any, name: string) =>
	applyDecorators(
		ApiOperation({ summary: 'Get a list of ' + name }),
		ApiOkResponse({
			description: 'Get a list of ' + name + ' successfully',
			schema: getPaginationSchema($ref)
		})
	);

/**
 * Swagger for get one API
 * @param $ref Class Schema
 * @param name Schema name
 * @example ApiGetOne(User, 'user')
 */
export const ApiGetOne = ($ref: any, name: string) =>
	applyDecorators(
		ApiOperation({ summary: 'Get details of a ' + name }),
		ApiOkResponse({
			description: 'Get details of a ' + name + ' successfully',
			schema: getBaseSchema($ref)
		}),
		ApiNotFoundResponse({ description: name + ' not found' })
	);

/**
 * Swagger for update API
 * @param $ref Class Schema
 * @param name Schema name
 * @example ApiUpdate(User, 'user')
 */
export const ApiUpdate = ($ref: any, name: string) =>
	applyDecorators(
		ApiOperation({ summary: 'Update a ' + name }),
		ApiOkResponse({
			description: 'Update a ' + name + ' successfully',
			schema: getBaseSchema($ref)
		}),
		ApiBadRequestResponse({
			description: 'Incorrect type or missing data in the request body'
		}),
		ApiNotFoundResponse({ description: name + ' not found' })
	);

/**
 * Swagger for delete API
 * @param $ref Class Schema
 * @param name Schema name
 * @example ApiDelete(User, 'user')
 */
export const ApiDelete = ($ref: any, name: string) =>
	applyDecorators(
		ApiOperation({ summary: 'Delete a ' + name }),
		ApiOkResponse({
			description: 'Delete a ' + name + ' successfully',
			schema: getBaseSchema($ref)
		}),
		ApiNotFoundResponse({ description: name + ' not found' })
	);

/**
 * Swagger to hide controller on production
 * @example ApiHideController()
 */
export const ApiHideController = () =>
	applyDecorators(ApiExcludeController(process.env.NODE_ENV === 'production'));

/**
 * Swagger for controller
 * @example ApiController()
 */
export const ApiController = (name: string) =>
	applyDecorators(ApiHideController(), ApiTags(`${name} API`));
