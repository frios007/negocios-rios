import { PaginationDto } from '../../dto/pagination.dto';
import { PaginatedResult } from '../types/pagination.types';

export function getPaginationParams(dto?: PaginationDto) {
  const page = dto?.page ?? 1;
  const limit = dto?.limit ?? 10;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
