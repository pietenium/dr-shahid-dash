import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useDebounce } from "@hooks/useDebounce";

/**
 * Search input with debounce
 * @param {Object} props
 * @param {Function} props.onSearch - Called with debounced search value
 * @param {string} [props.placeholder='Search...'] - Placeholder text
 * @param {number} [props.debounceMs=300] - Debounce delay in ms
 * @param {string} [props.className] - Additional classes
 * @param {string} [props.initialValue=''] - Initial search value
 */
function SearchInput({
  onSearch,
  placeholder = "Search...",
  debounceMs = 300,
  className = "",
  initialValue = "",
}) {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, debounceMs);

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <div className={`relative ${className}`}>
      <FontAwesomeIcon
        icon={faSearch}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-para-light dark:text-text-para-dark"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full pl-10 pr-8 py-2 text-sm rounded-lg
          bg-card-light dark:bg-card-dark
          border border-border-light dark:border-border-dark
          text-text-heading-light dark:text-text-heading-dark
          placeholder:text-text-para-light dark:placeholder:text-text-para-dark
          focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
          transition-all duration-200
        `.trim()}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Clear search"
        >
          <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
