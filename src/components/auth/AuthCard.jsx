/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const AuthCard = ({
  title,
  subtitle,
  icon,
  children,
  maxWidth = "max-w-md",
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg-light dark:bg-bg-dark">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`
          w-full ${maxWidth}
          bg-card-light dark:bg-card-dark
          rounded-2xl shadow-xl
          border border-border-light dark:border-border-dark
          p-8
        `}
      >
        {/* Icon Section */}
        {icon && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 rounded-full bg-brand-softbg dark:bg-brand-primary/10 flex items-center justify-center">
              <FontAwesomeIcon
                icon={icon}
                className="w-8 h-8 text-brand-primary"
              />
            </div>
          </motion.div>
        )}

        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-text-heading-light dark:text-text-heading-dark mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-text-para-light dark:text-text-para-dark">
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthCard;
