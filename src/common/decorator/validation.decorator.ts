import { applyDecorators } from '@nestjs/common';
import * as validator from 'class-validator';

import { translate } from '@/module/i18n/i18n.helper';
import { logger, MsgIds } from '../logger/logger';

export const IsString = (validationOptions?: validator.ValidationOptions) => {
	return applyDecorators(
		validator.IsString({ ...validationOptions, message: translate('validation.IS_STRING') })
	);
};

export const IsNotEmpty = (validationOptions?: validator.ValidationOptions) =>
	applyDecorators(
		validator.IsNotEmpty({
			...validationOptions,
			message: translate('validation.IS_NOT_EMPTY')
		})
	);

export const IsEmail = (validationOptions?: validator.ValidationOptions) =>
	applyDecorators(
		validator.IsEmail({}, { ...validationOptions, message: logger.getMessage(MsgIds.M001003) })
	);

export const IsNumber = (
	options?: validator.IsNumberOptions,
	validationOptions?: validator.ValidationOptions
) =>
	applyDecorators(
		validator.IsNumber(options, {
			...validationOptions,
			message: logger.getMessage(MsgIds.M001004)
		})
	);

export const IsNumberString = (validationOptions?: validator.ValidationOptions) =>
	applyDecorators(
		validator.IsNumberString(
			{},
			{
				...validationOptions,
				message: logger.getMessage(MsgIds.M001005)
			}
		)
	);

export const IsDateString = (validationOptions?: validator.ValidationOptions) =>
	applyDecorators(
		validator.IsDateString(
			{},
			{
				...validationOptions,
				message: logger.getMessage(MsgIds.M001006)
			}
		)
	);

export const Min = (minValue: number, validationOptions?: validator.ValidationOptions) =>
	applyDecorators(
		validator.Min(minValue, {
			...validationOptions,
			message: logger.getMessage(MsgIds.M001007)
		})
	);

export const Max = (maxValue: number, validationOptions?: validator.ValidationOptions) =>
	applyDecorators(
		validator.Max(maxValue, {
			...validationOptions,
			message: logger.getMessage(MsgIds.M001008)
		})
	);
