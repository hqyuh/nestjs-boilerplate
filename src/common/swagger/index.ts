import { INestApplication, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import {
	SWAGGER_API_CURRENT_VERSION,
	SWAGGER_API_DESCRIPTION,
	SWAGGER_API_NAME,
	SWAGGER_API_PORT,
	SWAGGER_API_ROOT
} from './swagger.const';

export const setupSwagger = (app: INestApplication) => {
	const logger = new Logger('Swagger');
	const options = new DocumentBuilder()
		.setTitle(SWAGGER_API_NAME)
		.setDescription(SWAGGER_API_DESCRIPTION)
		.setVersion(SWAGGER_API_CURRENT_VERSION)
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, options);
	SwaggerModule.setup(SWAGGER_API_ROOT, app, document, {
		swaggerOptions: {
			persistAuthorization: true,
			tagsSorter: 'alpha',
			operationsSorter: (a, b) => {
				const methodsOrder = ['get', 'post', 'put', 'patch', 'delete', 'options', 'trace'];
				let result =
					methodsOrder.indexOf(a.get('method')) - methodsOrder.indexOf(b.get('method'));

				if (result === 0) {
					result = a.get('path').localeCompare(b.get('path'));
				}

				return result;
			}
		}
	});
	logger.log(
		`Your documentation is running on http://localhost:${SWAGGER_API_PORT}/${SWAGGER_API_ROOT}`
	);
};
