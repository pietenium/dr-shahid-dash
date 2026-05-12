import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/**
 * Loading spinner component
 * @param {Object} props
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Spinner size
 * @param {string} [props.className] - Additional classes
 */
function Spinner({ size = "md", className = "" }) {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      role="status"
      aria-label="Loading"
    >
      <FontAwesomeIcon
        icon={faSpinner}
        className={`${sizeMap[size]} text-brand-primary animate-spin`}
      />
    </div>
  );
}

export default Spinner;
