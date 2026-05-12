/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

/**
 * Reusable Pagination component
 * @param {Object} props
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Page change handler receives page number
 * @param {number} [props.totalDocs] - Total documents count
 * @param {number} [props.limit] - Items per page
 */
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalDocs,
  limit,
}) {
  if (totalPages <= 1) return null;

  /**
   * Generate page numbers with ellipsis
   * @returns {Array<number|string>} Page numbers array
   */
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = Math.min(5, totalPages - 1);
      }
      if (currentPage >= totalPages - 2) {
        start = Math.max(totalPages - 4, 2);
      }

      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const startItem = (currentPage - 1) * (limit || 10) + 1;
  const endItem = Math.min(currentPage * (limit || 10), totalDocs || 0);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {totalDocs && (
        <p className="text-sm text-text-para-light dark:text-text-para-dark">
          Showing {startItem}–{endItem} of {totalDocs}
        </p>
      )}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
        </button>

        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 py-1 text-sm text-text-para-light dark:text-text-para-dark"
            >
              ...
            </span>
          ) : (
            <motion.button
              key={page}
              onClick={() => onPageChange(page)}
              whileTap={{ scale: 0.95 }}
              className={`
                min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  page === currentPage
                    ? "bg-brand-primary text-white shadow-sm"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-text-heading-light dark:text-text-heading-dark"
                }
              `.trim()}
            >
              {page}
            </motion.button>
          ),
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
