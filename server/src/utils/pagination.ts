export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const paginate = (page: number, limit: number, total: number): Pagination => ({
  page,
  limit,
  total,
  total_pages: Math.max(1, Math.ceil(total / limit)),
});

export const offsetOf = (page: number, limit: number): number => (page - 1) * limit;
