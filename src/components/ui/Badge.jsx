/**
 * Badge variants
 * @typedef {'default'|'success'|'warning'|'danger'|'info'|'purple'} BadgeVariant
 */

const variantStyles = {
  default: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  success:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  warning:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  purple:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

/**
 * Reusable Badge component
 * @param {Object} props
 * @param {BadgeVariant} [props.variant='default'] - Badge color variant
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} [props.className] - Additional classes
 * @param {boolean} [props.dot=false] - Show colored dot indicator
 */
function Badge({ variant = "default", children, className = "", dot = false }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `.trim()}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export default Badge;
