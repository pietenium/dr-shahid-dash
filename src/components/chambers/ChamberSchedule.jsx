/* eslint-disable no-unused-vars */
import { memo } from "react";
import { motion } from "framer-motion";

/**
 * Day order for sorting schedule
 */
const DAY_ORDER = {
  SATURDAY: 0,
  SUNDAY: 1,
  MONDAY: 2,
  TUESDAY: 3,
  WEDNESDAY: 4,
  THURSDAY: 5,
  FRIDAY: 6,
};

/**
 * Format day for display (e.g., "SATURDAY" → "Saturday")
 */
const formatDay = (day) => day.charAt(0) + day.slice(1).toLowerCase();

/**
 * ChamberSchedule - Clean schedule table showing active days and times
 *
 * @param {Object} props
 * @param {Array<{activeDay: string, startTime: string, endTime: string}>} props.activeDates - Schedule data
 * @param {boolean} [props.compact=false] - Compact mode for cards
 */
const ChamberSchedule = memo(function ChamberSchedule({
  activeDates = [],
  compact = false,
}) {
  // Sort by day order
  const sorted = [...activeDates].sort(
    (a, b) => (DAY_ORDER[a.activeDay] ?? 7) - (DAY_ORDER[b.activeDay] ?? 7),
  );

  if (sorted.length === 0) {
    return (
      <p className="text-xs text-text-para-light dark:text-text-para-dark italic">
        No schedule set
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border-light dark:border-border-dark">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800/50">
            <th
              className={`px-3 py-2 text-left font-medium text-text-para-light dark:text-text-para-dark uppercase tracking-wider ${compact ? "text-[10px]" : ""}`}
            >
              Day
            </th>
            <th
              className={`px-3 py-2 text-left font-medium text-text-para-light dark:text-text-para-dark uppercase tracking-wider ${compact ? "text-[10px]" : ""}`}
            >
              Start
            </th>
            <th
              className={`px-3 py-2 text-left font-medium text-text-para-light dark:text-text-para-dark uppercase tracking-wider ${compact ? "text-[10px]" : ""}`}
            >
              End
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((date, index) => (
            <motion.tr
              key={date.activeDay}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="border-t border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
            >
              <td
                className={`px-3 py-2 font-medium text-text-heading-light dark:text-text-heading-dark ${compact ? "text-[10px]" : ""}`}
              >
                {formatDay(date.activeDay)}
              </td>
              <td
                className={`px-3 py-2 text-text-para-light dark:text-text-para-dark font-mono ${compact ? "text-[10px]" : ""}`}
              >
                {date.startTime}
              </td>
              <td
                className={`px-3 py-2 text-text-para-light dark:text-text-para-dark font-mono ${compact ? "text-[10px]" : ""}`}
              >
                {date.endTime}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default ChamberSchedule;
