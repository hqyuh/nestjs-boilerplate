import {
	ArgumentMetadata,
	BadRequestException,
	HttpStatus,
	Injectable,
	PipeTransform
} from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
	async transform(value: any, { metatype }: ArgumentMetadata) {
		if (!value) {
			throw new BadRequestException('No data submitted');
		}

		if (!metatype || !this.toValidate(metatype)) {
			return value;
		}
		const object = plainToInstance(metatype, value);
		const errors = await validate(object);
		if (errors.length > 0) {
			throw new HttpException(
				{
					message: 'Input data validation failed',
					errors: this.buildError(errors)
				},
				HttpStatus.BAD_REQUEST
			);
		}
		return object;
	}

	private buildError(errors: any) {
		const result = {};
		errors.forEach((el: any) => {
			const prop = el.property;
			Object.entries(el.constraints).forEach((constraint) => {
				result[prop + '-' + constraint[0]] = `${constraint[1]}`;
			});
		});
		return result;
	}

	private toValidate(metatype: Function): boolean {
		const types: Function[] = [String, Boolean, Number, Array, Object];
		return !types.includes(metatype);
	}
}
