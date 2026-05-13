/* eslint-disable no-unused-vars */
import { memo } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWaveSquare, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Avatar from "@components/ui/Avatar";
import Badge from "@components/ui/Badge";
import { formatRelativeTime } from "@utils/formatDate";

/**
 * Module badge color mapping
 */
const moduleColors = {
  articles: "success",
  research: "info",
  auth: "purple",
  appointments: "warning",
  contact: "info",
  users: "purple",
  "app-info": "default",
  testimonials: "warning",
};

/**
 * ActivityTimeline - Recent activity log entries for dashboard
 * Shows user avatar, action, module badge, and relative timestamp
 *
 * @param {Object} props
 * @param {Array<Object>} props.logs - Activity log data array
 * @param {boolean} [props.loading=false] - Show skeleton loader
 */
const ActivityTimeline = memo(function ActivityTimeline({
  logs = [],
  loading = false,
}) {
  // Skeleton loader
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5"
      >
        <div className="skeleton h-5 w-36 rounded mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-start gap-3 py-3 border-b border-border-light dark:border-border-dark last:border-0"
          >
            <div className="skeleton w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="flex gap-2">
                <div className="skeleton h-4 w-16 rounded-full" />
                <div className="skeleton h-3 w-20 rounded" />
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5 hover:shadow-md transition-shadow duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon
            icon={faWaveSquare}
            className="w-4 h-4 text-brand-primary"
          />
          <h3 className="text-base font-semibold text-text-heading-light dark:text-text-heading-dark">
            Recent Activity
          </h3>
        </div>
        <Link
          to="/activity-logs"
          className="text-xs text-brand-primary hover:text-brand-hover transition-colors flex items-center gap-1 font-medium"
        >
          View All Logs
          <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
        </Link>
      </div>

      {/* Timeline */}
      <div className="relative">
        {logs.map((log, index) => (
          <motion.div
            key={log._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className="flex items-start gap-3 py-2.5 border-b border-border-light dark:border-border-dark last:border-0 relative"
          >
            {/* Timeline line */}
            {index < logs.length - 1 && (
              <div className="absolute left-4 top-10 bottom-0 w-px bg-border-light dark:bg-border-dark" />
            )}

            {/* Avatar */}
            <Avatar
              name={log.user?.name || "Unknown"}
              size="sm"
              color={index % 2 === 0 ? "primary" : "secondary"}
              className="relative z-10 shrink-0"
            />

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm text-text-heading-light dark:text-text-heading-dark">
                <span className="font-medium">
                  {log.user?.name || "System"}
                </span>{" "}
                <span className="text-text-para-light dark:text-text-para-dark">
                  {log.action}
                </span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={moduleColors[log.module] || "default"}
                  className="text-[10px] px-1.5"
                >
                  {log.module}
                </Badge>
                <span className="text-[10px] text-text-para-light dark:text-text-para-dark">
                  {formatRelativeTime(log.createdAt)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Empty State */}
        {logs.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-text-para-light dark:text-text-para-dark">
              No recent activity
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default ActivityTimeline;
