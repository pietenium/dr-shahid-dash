/* eslint-disable no-unused-vars */
import { useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";

/**
 * StarRating - Interactive 5-star rating component
 * Features hover preview, click to set, animated fill transitions
 *
 * @param {Object} props
 * @param {number} [props.value=0] - Current rating value (1-5)
 * @param {Function} props.onChange - Called with new rating value on click
 * @param {boolean} [props.disabled=false] - Disable interaction
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Star size
 * @param {boolean} [props.readOnly=false] - Display only, no interaction
 */
const StarRating = memo(function StarRating({
  value = 0,
  onChange,
  disabled = false,
  size = "md",
  readOnly = false,
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const displayRating = hoverRating || value;

  /**
   * Handle star click
   * @param {number} star - Clicked star number (1-5)
   */
  const handleClick = useCallback(
    (star) => {
      if (readOnly || disabled) return;
      // Toggle: clicking the same star resets to 0
      onChange?.(star === value ? 0 : star);
    },
    [value, onChange, readOnly, disabled],
  );

  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          whileHover={{ scale: readOnly ? 1 : 1.2 }}
          whileTap={{ scale: readOnly ? 1 : 0.9 }}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readOnly && !disabled && setHoverRating(star)}
          onMouseLeave={() => !readOnly && setHoverRating(0)}
          disabled={disabled}
          className={`
            transition-colors duration-150
            ${readOnly ? "cursor-default" : disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
          `}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          role="radio"
          aria-checked={value === star}
        >
          <motion.div
            initial={false}
            animate={{
              scale: displayRating >= star ? 1 : 1,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <FontAwesomeIcon
              icon={displayRating >= star ? faStarSolid : faStarRegular}
              className={`
                ${sizeClasses[size]}
                ${
                  displayRating >= star
                    ? "text-[#2FA084] drop-shadow-sm"
                    : "text-gray-300 dark:text-gray-600"
                }
                transition-colors duration-150
              `}
            />
          </motion.div>
        </motion.button>
      ))}

      {!readOnly && value > 0 && (
        <span className="ml-2 text-sm font-semibold text-text-heading-light dark:text-text-heading-dark">
          {value}/5
        </span>
      )}
    </div>
  );
});

export default StarRating;
