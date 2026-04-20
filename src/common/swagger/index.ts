import { GLOBAL_PATH } from '@/common/constant/route.constant';
import { INestApplication, Logger } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import {
  SWAGGER_API_CURRENT_VERSION,
  SWAGGER_API_DESCRIPTION,
  SWAGGER_API_NAME,
  SWAGGER_API_PORT,
} from './swagger.const';

const filterDocumentByPrefix = (document: OpenAPIObject, versionPrefix: string): OpenAPIObject => {
  const filteredPaths = Object.fromEntries(
    Object.entries(document.paths).filter(([path]) => path.startsWith(versionPrefix))
  );

  return {
    ...document,
    paths: filteredPaths,
  };
};

export const setupSwagger = (app: INestApplication) => {
  const logger = new Logger('Swagger');
  const options = new DocumentBuilder()
    .setTitle(SWAGGER_API_NAME)
    .setDescription(SWAGGER_API_DESCRIPTION)
    .setVersion(SWAGGER_API_CURRENT_VERSION)
    .setOpenAPIVersion('3.1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'accessToken')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'refreshToken')
    .addCookieAuth('token', {
      name: 'refresh-token',
      type: 'apiKey',
    })
    .build();

  const swaggerSetupOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: (a: { get: (arg: string) => string }, b: { get: (arg: string) => string }): number => {
        const methodsOrder = ['get', 'post', 'put', 'patch', 'delete', 'options', 'trace'];
        let result = methodsOrder.indexOf(a.get('method')) - methodsOrder.indexOf(b.get('method'));

        if (result === 0) {
          result = a.get('path').localeCompare(b.get('path'));
        }

        return result;
      },
    },
  } satisfies Parameters<typeof SwaggerModule.setup>[3];

  const fullDocument = SwaggerModule.createDocument(app, options);

  const v1Document = filterDocumentByPrefix(fullDocument, `/${GLOBAL_PATH}/v1`);
  const v2Document = filterDocumentByPrefix(fullDocument, `/${GLOBAL_PATH}/v2`);

  const v1DocsRoot = `${GLOBAL_PATH}/v1/docs`;
  const v2DocsRoot = `${GLOBAL_PATH}/v2/docs`;

  SwaggerModule.setup(v1DocsRoot, app, v1Document, swaggerSetupOptions);
  SwaggerModule.setup(v2DocsRoot, app, v2Document, swaggerSetupOptions);

  logger.log(`Swagger v1: http://localhost:${SWAGGER_API_PORT}/${v1DocsRoot}`);
  logger.log(`Swagger v2: http://localhost:${SWAGGER_API_PORT}/${v2DocsRoot}`);
};
