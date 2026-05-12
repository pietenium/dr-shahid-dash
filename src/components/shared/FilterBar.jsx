/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import Button from "@components/ui/Button";
import SearchInput from "./SearchInput";

/**
 * Reusable filter bar component
 * Supports search, date range, status tabs, and custom filters
 * @param {Object} props
 * @param {Function} [props.onSearch] - Search callback
 * @param {string} [props.searchPlaceholder='Search...'] - Search placeholder
 * @param {Array<{key: string, label: string, count?: number}>} [props.tabs] - Status/category tabs
 * @param {string} [props.activeTab] - Currently active tab key
 * @param {Function} [props.onTabChange] - Tab change callback
 * @param {React.ReactNode} [props.filters] - Additional filter components (date pickers, select dropdowns)
 * @param {Function} [props.onClear] - Clear all filters callback
 * @param {boolean} [props.showClear=false] - Show clear button
 * @param {string} [props.className] - Additional classes
 * @param {number} [props.totalResults] - Total filtered results count
 */
function FilterBar({
  onSearch,
  searchPlaceholder = "Search...",
  tabs,
  activeTab,
  onTabChange,
  filters,
  onClear,
  showClear = false,
  className = "",
  totalResults,
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onSearch && (
          <SearchInput
            onSearch={onSearch}
            placeholder={searchPlaceholder}
            className="sm:max-w-xs w-full"
          />
        )}
        {filters && (
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {filters}
          </div>
        )}
        {showClear && onClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            leftIcon={faXmark}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Tabs Row */}
      {tabs && tabs.length > 0 && (
        <div className="flex items-center gap-1 border-b border-border-light dark:border-border-dark overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange?.(tab.key)}
              className={`
                relative px-4 py-2.5 text-sm font-medium whitespace-nowrap
                transition-colors duration-200
                ${
                  activeTab === tab.key
                    ? "text-brand-primary"
                    : "text-text-para-light dark:text-text-para-dark hover:text-text-heading-light dark:hover:text-text-heading-dark"
                }
              `.trim()}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`
                  ml-1.5 px-1.5 py-0.5 rounded-full text-xs
                  ${
                    activeTab === tab.key
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "bg-gray-100 dark:bg-gray-700 text-text-para-light dark:text-text-para-dark"
                  }
                `.trim()}
                >
                  {tab.count}
                </span>
              )}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="filter-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
          {totalResults !== undefined && (
            <span className="ml-auto text-xs text-text-para-light dark:text-text-para-dark">
              {totalResults} results
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default FilterBar;
