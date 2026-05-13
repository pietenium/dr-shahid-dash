/* eslint-disable no-unused-vars */
import { memo } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import StatusBadge from "@components/shared/StatusBadge";
import { formatDate } from "@utils/formatDate";

/**
 * RecentAppointments - Mini-list of latest appointments for dashboard
 * Shows patient name, date, status, and phone
 *
 * @param {Object} props
 * @param {Array<Object>} props.appointments - Appointment data array
 * @param {boolean} [props.loading=false] - Show skeleton loader
 */
const RecentAppointments = memo(function RecentAppointments({
  appointments = [],
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
            className="flex items-center gap-3 py-3 border-b border-border-light dark:border-border-dark last:border-0"
          >
            <div className="skeleton w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
            <div className="skeleton h-5 w-20 rounded-full" />
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
            icon={faCalendar}
            className="w-4 h-4 text-brand-primary"
          />
          <h3 className="text-base font-semibold text-text-heading-light dark:text-text-heading-dark">
            Recent Appointments
          </h3>
        </div>
        <Link
          to="/appointments"
          className="text-xs text-brand-primary hover:text-brand-hover transition-colors flex items-center gap-1 font-medium"
        >
          View All
          <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
        </Link>
      </div>

      {/* Appointment List */}
      <div className="space-y-0">
        {appointments.map((appointment, index) => (
          <motion.div
            key={appointment._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 py-2.5 border-b border-border-light dark:border-border-dark last:border-0"
          >
            {/* Avatar Initials */}
            <div className="w-8 h-8 rounded-full bg-brand-softbg dark:bg-brand-primary/10 flex items-center justify-center  shrink-0">
              <span className="text-xs font-semibold text-brand-primary">
                {appointment.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-heading-light dark:text-text-heading-dark truncate">
                {appointment.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-text-para-light dark:text-text-para-dark">
                <span>{formatDate(appointment.preferredDate, "MMM dd")}</span>
                <span>•</span>
                <span>{appointment.phone}</span>
              </div>
            </div>

            {/* Status */}
            <StatusBadge status={appointment.status} />
          </motion.div>
        ))}

        {/* Empty State */}
        {appointments.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-text-para-light dark:text-text-para-dark">
              No recent appointments
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default RecentAppointments;
