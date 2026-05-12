/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

/**
 * Button variants
 * @typedef {'primary'|'secondary'|'outline'|'ghost'|'danger'} ButtonVariant
 * @typedef {'sm'|'md'|'lg'} ButtonSize
 */

const variantStyles = {
  primary:
    "bg-brand-primary text-white hover:bg-brand-hover hover:scale-[1.02]",
  secondary:
    "bg-brand-secondary text-white hover:brightness-110 hover:scale-[1.02]",
  outline:
    "border border-brand-primary text-brand-primary hover:bg-brand-softbg dark:hover:bg-brand-primary/10 hover:scale-[1.02]",
  ghost:
    "text-text-para-light dark:text-text-para-dark hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-[1.02]",
  danger: "bg-red-500 text-white hover:bg-red-600 hover:scale-[1.02]",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

/**
 * Reusable Button component with variants, sizes, loading state
 * @param {Object} props
 * @param {ButtonVariant} [props.variant='primary'] - Visual variant
 * @param {ButtonSize} [props.size='md'] - Button size
 * @param {boolean} [props.loading=false] - Show loading spinner
 * @param {boolean} [props.disabled=false] - Disable button
 * @param {import('@fortawesome/react-fontawesome').IconProp} [props.leftIcon] - Left icon
 * @param {import('@fortawesome/react-fontawesome').IconProp} [props.rightIcon] - Right icon
 * @param {React.ReactNode} props.children - Button label
 * @param {string} [props.className] - Additional classes
 * @param {'button'|'submit'|'reset'} [props.type='button'] - Button type
 * @param {Function} [props.onClick] - Click handler
 */
const Button = React.memo(function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  type = "button",
  onClick,
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileTap={{ scale: isDisabled ? 1 : 0.97 }}
      transition={{ duration: 0.2 }}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg
        transition-all duration-200 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `.trim()}
      {...rest}
    >
      {loading ? (
        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
      ) : leftIcon ? (
        <FontAwesomeIcon icon={leftIcon} />
      ) : null}
      {children}
      {!loading && rightIcon && <FontAwesomeIcon icon={rightIcon} />}
    </motion.button>
  );
});

export default Button;
