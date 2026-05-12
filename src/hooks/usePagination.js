import { useState, useCallback, useMemo } from "react";

/**
 * Pagination hook for managing page state
 * @param {Object} options - Pagination options
 * @param {number} [options.initialPage=1] - Starting page
 * @param {number} [options.initialLimit=10] - Items per page
 * @returns {Object} Pagination state and handlers
 */
export function usePagination({ initialPage = 1, initialLimit = 10 } = {}) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const nextPage = useCallback(() => setPage((p) => p + 1), []);
  const prevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const goToPage = useCallback((p) => setPage(p), []);
  const setPageSize = useCallback((size) => {
    setLimit(size);
    setPage(1);
  }, []);

  const paginationParams = useMemo(() => ({ page, limit }), [page, limit]);

  return {
    page,
    limit,
    nextPage,
    prevPage,
    goToPage,
    setPageSize,
    paginationParams,
  };
}
