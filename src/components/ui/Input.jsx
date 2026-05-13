import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

/**
 * Reusable Input component with label, error, icons
 * @param {Object} props
 * @param {string} [props.label] - Input label
 * @param {string} [props.error] - Error message
 * @param {string} [props.helperText] - Helper text below input
 * @param {import('@fortawesome/react-fontawesome').IconProp} [props.leftIcon] - Left icon
 * @param {import('@fortawesome/react-fontawesome').IconProp} [props.rightIcon] - Right icon
 * @param {string} [props.type='text'] - Input type
 * @param {boolean} [props.showPasswordToggle=false] - Show password visibility toggle
 * @param {string} [props.className] - Additional classes for wrapper
 * @param {string} [props.inputClassName] - Additional classes for input
 */
const Input = React.forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    type = "text",
    showPasswordToggle = false,
    className = "",
    inputClassName = "",
    id,
    ...rest
  },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-heading-light dark:text-text-heading-dark mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-para-light dark:text-text-para-dark">
            <FontAwesomeIcon icon={leftIcon} className="w-4 h-4" />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={`
            w-full rounded-lg border
            bg-card-light dark:bg-card-dark
            text-text-heading-light dark:text-text-heading-dark
            placeholder:text-text-para-light dark:placeholder:text-text-para-dark
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${leftIcon ? "pl-10" : "pl-3"}
            ${rightIcon || showPasswordToggle ? "pr-10" : "pr-3"}
            ${error ? "border-red-500 focus:ring-red-500" : "border-border-light dark:border-border-dark"}
            py-2 text-sm
            ${inputClassName}
          `.trim()}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          {...rest}
        />
        {showPasswordToggle && isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-para-light dark:text-text-para-dark hover:text-brand-primary transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye}
              className="w-4 h-4"
            />
          </button>
        )}
        {!showPasswordToggle && rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-para-light dark:text-text-para-dark">
            <FontAwesomeIcon icon={rightIcon} className="w-4 h-4" />
          </span>
        )}
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-xs text-red-500"
          role="alert"
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          id={`${inputId}-helper`}
          className="mt-1 text-xs text-text-para-light dark:text-text-para-dark"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
