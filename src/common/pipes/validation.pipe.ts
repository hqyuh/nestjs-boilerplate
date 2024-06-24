import {
	PipeTransform,
	Injectable,
	ArgumentMetadata,
	BadRequestException,
	HttpStatus
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
	async transform(value: any, { metatype }: ArgumentMetadata) {
		if (!value) {
			console.log('hehe');
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
		return value;
	}

	private buildError(errors: any) {
		const result = {};
		errors.forEach((el: any) => {
			let prop = el.property;
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
