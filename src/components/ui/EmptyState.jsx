/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInbox } from "@fortawesome/free-solid-svg-icons";

/**
 * Empty state placeholder for lists and tables
 * @param {Object} props
 * @param {string} [props.title='No data found'] - Empty state title
 * @param {string} [props.description] - Empty state description
 * @param {import('@fortawesome/react-fontawesome').IconProp} [props.icon=faInbox] - Icon to display
 * @param {React.ReactNode} [props.action] - Optional action button
 */
function EmptyState({
  title = "No data found",
  description,
  icon = faInbox,
  action,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-16 h-16 rounded-full bg-brand-softbg dark:bg-brand-primary/10 flex items-center justify-center mb-4">
        <FontAwesomeIcon icon={icon} className="w-8 h-8 text-brand-primary" />
      </div>
      <h3 className="text-lg font-medium text-text-heading-light dark:text-text-heading-dark mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-text-para-light dark:text-text-para-dark text-center max-w-md">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}

export default EmptyState;
