import { BaseEntity } from '@/common/base/base.entity';
import {
	DeepPartial,
	DeleteResult,
	FindOptionsWhere,
	SelectQueryBuilder,
	UpdateResult
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

/**
 * @template T Type of the record data
 */
export abstract class AbstractBaseService<T extends BaseEntity> {
	/**
	 * Create a record
	 * @param data Data to create the record
	 * @returns Promise<T>
	 * @example service.create({ name: 'John Doe' })
	 */
	abstract create(data: DeepPartial<T>): Promise<T>;

	/**
	 * Create multiple records
	 * @param data Data to create records
	 * @returns Promise<T[]>
	 * @example service.createMany([{ name: 'John Doe' }, { name: 'Jane Doe' }])
	 */
	abstract createMany(data: DeepPartial<T>[]): Promise<T[]>;

	/**
	 * Get a single record
	 * @param options Options to retrieve the record
	 * @returns Promise<T | null>
	 * @example service.getOne({ where: { name: 'John Doe' } })
	 */
	abstract getOne(options: FindOptions<T>): Promise<T | null>;

	/**
	 * Get a single record or throw a NotFound error if not found
	 * @param options Options to retrieve the record
	 * @returns Promise<T>
	 * @example service.getOneOrFail({ where: { name: 'John Doe' } })
	 */
	abstract getOneOrFail(options: FindOrFailOptions<T>): Promise<T>;

	/**
	 * Get a record by ID
	 * @param id ID of the record
	 * @param options Options to retrieve the record
	 * @returns Promise<T | null>
	 * @example service.getOneById('uuid', { where: { name: 'John Doe' } })
	 */
	abstract getOneById(id: number, options?: Partial<FindOptions<T>>): Promise<T | null>;

	/**
	 * Get a record by ID or throw a NotFound error if not found
	 * @param id ID of the record
	 * @param options Options to retrieve the record
	 * @returns Promise<T>
	 * @example service.getOneByIdOrFail('uuid', { where: { name: 'John Doe' } })
	 */
	abstract getOneByIdOrFail(id: number, options?: Partial<FindOrFailOptions<T>>): Promise<T>;

	/**
	 * Get all records
	 * @param options Options to retrieve records
	 * @returns Promise<T[]>
	 * @example service.getAll({ where: { name: 'John Doe' } })
	 */
	abstract getAll(options?: Partial<FindOptions<T>>): Promise<T[]>;

	/**
	 * Get all records with pagination
	 * @param options Options to retrieve records
	 * @returns Promise<IPaginationResponse<T>>
	 * @example service.getAllPaginated({ where: { name: 'John Doe' }, limit: '10', page: '1' })
	 */
	abstract getAllPaginated(options?: FindPaginatedOptions<T>): Promise<IPaginationResponse<T>>;

	/**
	 * Update a record, throw a NotFound error if not found
	 * @param options Options to retrieve the record
	 * @param data Data to update the record
	 * @returns Promise<T>
	 * @example service.update({ where: { name: 'John Doe' } }, { name: 'Jane Doe updated' })
	 */
	abstract update(options: FindOrFailOptions<T>, data: QueryDeepPartialEntity<T>): Promise<T>;

	/**
	 * Update a record by ID, throw a NotFound error if not found
	 * @param id ID of the record
	 * @param data Data to update the record
	 * @param options Options to retrieve the record
	 * @returns Promise<T>
	 * @example service.updateById('uuid', { name: 'Jane Doe updated' }, { loadEagerRelations: false, errorMessage: 'Not found' })
	 */
	abstract updateById(
		id: number,
		data: QueryDeepPartialEntity<T>,
		options?: Partial<FindOrFailOptions<T>>
	): Promise<T>;

	/**
	 * Remove a record, throw a NotFound error if not found
	 * @param options Options to retrieve the record
	 * @returns Promise<T>
	 * @example service.remove({ where: { name: 'John Doe' } })
	 */
	abstract remove(options: FindOrFailOptions<T>): Promise<T>;

	/**
	 * Remove a record by ID, throw a NotFound error if not found
	 * @param id ID of the record
	 * @param options Options to retrieve the record
	 * @returns Promise<T>
	 * @example service.removeById('uuid', { loadEagerRelations: false, errorMessage: 'Not found' })
	 */
	abstract removeById(id: number, options?: Partial<FindOrFailOptions<T>>): Promise<T>;

	/**
	 * Remove all records
	 * @returns Promise<T>
	 * @example service.removeAll()
	 */
	abstract removeAll(): Promise<DeleteResult>;

	/**
	 * Soft remove a record, throw a NotFound error if not found
	 * @param options Options to retrieve the record
	 * @returns Promise<T>
	 * @example service.softRemove({ where: { name: 'John Doe' } })
	 */
	abstract softRemove(options: FindOrFailOptions<T>): Promise<T>;

	/**
	 * Soft remove a record by ID
	 * @param id ID of the record
	 * @param options Options to retrieve the record
	 * @returns Promise<T>
	 * @example service.softRemoveById('uuid', { loadEagerRelations: false, errorMessage: 'Not found' })
	 */
	abstract softRemoveById(id: number, options?: Partial<FindOrFailOptions<T>>): Promise<T>;

	/**
	 * Soft remove all records
	 * @returns Promise<T>
	 * @example service.softRemoveAll()
	 */
	abstract softRemoveAll(): Promise<DeleteResult>;

	/**
	 * Count records
	 * @param options Options to retrieve records
	 * @returns Promise<number>
	 * @example service.count({ where: { name: 'John Doe' } })
	 */
	abstract count(options: Partial<FindOptions<T>>): Promise<number>;

	abstract getQueryBuilder(alias?: string): SelectQueryBuilder<T>;

	/**
	 * Increment a field
	 * @param where Options to retrieve records
	 * @param field Name of the field to increment
	 * @param value Increment value
	 * @returns Promise<UpdateResult>
	 * @example service.increment({ where: { name: 'John Doe' } }, 'age', 1)
	 */
	abstract increment(
		where: FindOptionsWhere<T>,
		field: string,
		value: number
	): Promise<UpdateResult>;

	/**
	 * Decrement a field
	 * @param where Options to retrieve records
	 * @param field Name of the field to decrement
	 * @param value Decrement value
	 * @returns Promise<UpdateResult>
	 * @example service.decrement({ where: { name: 'John Doe' } }, 'age', 1)
	 */
	abstract decrement(
		where: FindOptionsWhere<T>,
		field: string,
		value: number
	): Promise<UpdateResult>;

	/**
	 * Get a record or create a new one
	 * @param options Options to retrieve the record
	 * @param data Data to create the record
	 * @returns Promise<T>
	 * @example service.getOneOrCreate({ where: { name: 'John Doe' } }, { name: 'John Doe' })
	 */
	abstract getOneOrCreate(options: FindOptions<T>, data?: DeepPartial<T>): Promise<T>;
}
