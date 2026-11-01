import { paginate } from 'nestjs-paginate';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { paginateWithErrors } from './paginate-with-errors';

vi.mock('nestjs-paginate', async (importOriginal) => {
  const actual = await importOriginal<typeof import('nestjs-paginate')>();
  return { ...actual, paginate: vi.fn() };
});

const config = {
  sortableColumns: ['createdAt', 'firstName'],
  filterableColumns: { firstName: true, email: true },
};

describe('paginateWithErrors', () => {
  beforeEach(() => vi.mocked(paginate).mockReset());

  it('maps nestjs-paginate meta onto pagination', async () => {
    const links = {
      first: '/?page=1&limit=10',
      current: '/?page=2&limit=10',
      next: '/?page=3&limit=10',
      last: '/?page=3&limit=10',
    };
    vi.mocked(paginate).mockResolvedValue({
      data: [{ id: '1' }],
      meta: { currentPage: 2, itemsPerPage: 10, totalItems: 21, totalPages: 3 },
      links,
    } as never);

    const withSelect = { ...config, select: ['id', 'email'] };
    await expect(
      paginateWithErrors({ path: '/', page: 2, limit: 10 }, {} as never, withSelect as never)
    ).resolves.toEqual({
      data: [{ id: '1' }],
      pagination: { page: 2, limit: 10, totalItems: 21, totalPages: 3 },
      links,
    });
    expect(paginate).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ select: undefined })
    );
  });
});
