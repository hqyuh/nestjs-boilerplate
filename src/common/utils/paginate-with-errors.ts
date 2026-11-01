import { type PaginateConfig, type PaginateQuery, paginate } from 'nestjs-paginate';
import { ObjectLiteral, Repository } from 'typeorm';

export async function paginateWithErrors<T extends ObjectLiteral>(
  query: PaginateQuery,
  repository: Repository<T>,
  config: PaginateConfig<T>
): Promise<IPaginationResponse<T>> {
  const result = await paginate(query, repository, {
    ...config,
    select: query.select?.length ? config.select : undefined,
    throwOnInvalidFilter: true,
  });

  return {
    data: result.data,
    pagination: {
      page: result.meta.currentPage ?? 1,
      limit: result.meta.itemsPerPage,
      totalItems: result.meta.totalItems ?? result.data.length,
      totalPages: result.meta.totalPages ?? 1,
    },
    links: result.links,
  };
}
