import { toast } from "sonner";

/**
 * Format and display API errors consistently
 * Handles various error response shapes and displays appropriate toast
 * @param {Error|Object} error - Error from API call
 * @param {string} [fallbackMessage='Something went wrong'] - Default error message
 * @returns {string} Formatted error message
 */
export function formatError(error, fallbackMessage = "Something went wrong") {
  let message = fallbackMessage;

  if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  }

  // Handle validation errors
  if (error?.response?.data?.errors?.length) {
    const fieldErrors = error.response.data.errors
      .map((e) => e.message)
      .join(", ");
    message = fieldErrors;
  }

  // Handle specific status codes
  if (error?.response?.status === 429) {
    message = "Too many attempts. Please try again later.";
  }

  return message;
}

/**
 * Format and toast API errors
 * @param {Error|Object} error - Error from API call
 * @param {string} [fallbackMessage='Something went wrong'] - Default error message
 */
export function toastError(error, fallbackMessage = "Something went wrong") {
  const message = formatError(error, fallbackMessage);
  toast.error(message);
  return message;
}
