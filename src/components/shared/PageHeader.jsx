/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router";

/**
 * Page header with breadcrumb and actions
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} [props.subtitle] - Page subtitle
 * @param {Array<{label: string, path?: string}>} [props.breadcrumb=[]] - Breadcrumb items
 * @param {React.ReactNode} [props.actions] - Action buttons/slot
 */
function PageHeader({ title, subtitle, breadcrumb = [], actions }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-text-para-light dark:text-text-para-dark mb-2">
          {breadcrumb.map((item, index) => (
            <span key={index} className="flex items-center gap-1">
              {index > 0 && (
                <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
              )}
              {item.path ? (
                <Link
                  to={item.path}
                  className="hover:text-brand-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-text-heading-light dark:text-text-heading-dark font-medium">
                  {item.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title and Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-heading-light dark:text-text-heading-dark">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-text-para-light dark:text-text-para-dark mt-1">
              {subtitle}
            </p>
          )}
          {/* Gradient accent line */}
          <div className="mt-2 h-0.5 w-16 bg-linear-to-r from-brand-primary to-brand-secondary rounded-full" />
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </motion.div>
  );
}

export default PageHeader;
