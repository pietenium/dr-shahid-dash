/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import Spinner from "@components/ui/Spinner";
import EmptyState from "@components/ui/EmptyState";

/**
 * Responsive data table component
 * Shows table on desktop (≥768px) and card stack on mobile
 * Includes skeleton loading state
 * @param {Object} props
 * @param {Array<{key: string, label: string, render?: Function, className?: string}>} props.columns - Column definitions
 * @param {Array<Object>} props.data - Row data array
 * @param {boolean} [props.loading=false] - Loading state
 * @param {string} [props.emptyText='No data found'] - Empty state text
 * @param {string} [props.emptyDescription] - Empty state description
 * @param {React.ReactNode} [props.emptyAction] - Empty state action
 * @param {Function} [props.onRowClick] - Row click handler
 */
function DataTable({
  columns,
  data = [],
  loading = false,
  emptyText = "No data found",
  emptyDescription,
  emptyAction,
  onRowClick,
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-12 rounded-lg skeleton"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <EmptyState
        title={emptyText}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-medium text-text-para-light dark:text-text-para-dark ${col.className || ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <motion.tr
                key={row._id || rowIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: rowIndex * 0.03 }}
                onClick={() => onRowClick?.(row)}
                className={`
                  border-b border-border-light dark:border-border-dark
                  hover:bg-brand-softbg/50 dark:hover:bg-brand-primary/5
                  transition-colors
                  ${onRowClick ? "cursor-pointer" : ""}
                `.trim()}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${col.className || ""}`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.map((row, rowIndex) => (
          <motion.div
            key={row._id || rowIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rowIndex * 0.05 }}
            onClick={() => onRowClick?.(row)}
            className={`
              p-4 rounded-lg
              bg-card-light dark:bg-card-dark
              border border-border-light dark:border-border-dark
              ${onRowClick ? "cursor-pointer" : ""}
            `.trim()}
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className="flex items-center justify-between py-1"
              >
                <span className="text-xs text-text-para-light dark:text-text-para-dark">
                  {col.label}
                </span>
                <span className="text-sm font-medium text-text-heading-light dark:text-text-heading-dark">
                  {col.render ? col.render(row) : row[col.key]}
                </span>
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </>
  );
}

export default DataTable;
