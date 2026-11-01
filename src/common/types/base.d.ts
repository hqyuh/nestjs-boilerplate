import { FindOptionsOrder, FindOptionsRelations, FindOptionsSelect, FindOptionsWhere } from 'typeorm';
import { BaseUuidEntity } from '@/common/base/base-uuid.entity';

declare global {
  type FindOptions<T extends BaseUuidEntity> = {
    /** Conditions */
    where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
    /** Sorting */
    order?: FindOptionsOrder<T>;
    /** Join tables */
    relations?: FindOptionsRelations<T>;
    /** Enable/disable eager loading */
    loadEagerRelations?: boolean;
    /** Include soft-deleted records */
    withDeleted?: boolean;
    /** Select fields to retrieve from the database */
    select?: FindOptionsSelect<T>;
  };

  type FindOrFailOptions<T extends BaseUuidEntity> = FindOptions<T> & {
    /** Error message when a record is not found */
    errorMessage?: string;
  };

  type FindPaginatedOptions<T extends BaseUuidEntity> = Partial<FindOptions<T>> & {
    /** Number of items per page */
    limit?: number;
    /** Current page number */
    page?: number;
    /**
     * Filtering
     * @examples { "name": "ABC" }
     */
    filter?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
  };

  type IPaginationMeta = {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };

  type IPaginationLinks = {
    first?: string;
    previous?: string;
    current: string;
    next?: string;
    last?: string;
  };

  type IPaginationResponse<T> = {
    /** Array of items */
    data: T[];
    pagination: IPaginationMeta;
    links?: IPaginationLinks;
  };

  type IResponse<T> = {
    /** Response status code */
    status: number;
    /** Message */
    message: string;
    /** Data */
    data: T;
    pagination?: IPaginationMeta;
    links?: IPaginationLinks;
    path: string;
    method: string;
    timestamp: string;
  };

  type GenerateTokenData = {
    accessToken: string;
  };

  type LogoutData = {
    success: boolean;
  };
}
