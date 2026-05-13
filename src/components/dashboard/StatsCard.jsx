/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { memo, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/**
 * Animated counter hook - counts up from 0 to target value
 * @param {number} end - Target value
 * @param {number} [duration=1500] - Animation duration in ms
 * @param {boolean} [start=true] - Whether to start counting
 * @returns {number} Current count value
 */
function useCountUp(end, duration = 1500, start = true) {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!start || end === 0) {
      setCount(end);
      return;
    }

    startTimeRef.current = null;

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration, start]);

  return count;
}

/**
 * StatsCard - Animated KPI card for dashboard statistics
 * Features count-up animation, icon, trend indicator, hover effects
 *
 * @param {Object} props
 * @param {string} props.title - Card label
 * @param {number} props.value - Numeric value to display
 * @param {import('@fortawesome/react-fontawesome').IconProp} props.icon - FontAwesome icon
 * @param {string} [props.iconBgColor='bg-brand-softbg'] - Icon background color class
 * @param {string} [props.iconColor='text-brand-primary'] - Icon color class
 * @param {string} [props.trend] - Trend label (e.g., "+12%")
 * @param {boolean} [props.trendUp=true] - Trend direction
 * @param {boolean} [props.loading=false] - Show skeleton
 * @param {number} [props.delay=0] - Stagger animation delay
 */
const StatsCard = memo(function StatsCard({
  title,
  value = 0,
  icon,
  iconBgColor = "bg-brand-softbg dark:bg-brand-primary/10",
  iconColor = "text-brand-primary",
  trend,
  trendUp = true,
  loading = false,
  delay = 0,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const count = useCountUp(value, 1500, isVisible && !loading);

  // Trigger animation when visible
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Skeleton loader
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.001, duration: 0.3 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="skeleton w-10 h-10 rounded-full" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
        <div className="skeleton h-8 w-24 rounded mb-1" />
        <div className="skeleton h-3 w-32 rounded" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.08)" }}
      className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5 transition-shadow duration-300 cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        {/* Icon Circle */}
        <div
          className={`w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center`}
        >
          <FontAwesomeIcon icon={icon} className={`w-5 h-5 ${iconColor}`} />
        </div>

        {/* Trend Badge */}
        {trend && (
          <span
            className={`
              inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium
              ${trendUp ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}
            `}
          >
            <span className="text-[10px]">{trendUp ? "↑" : "↓"}</span>
            {trend}
          </span>
        )}
      </div>

      {/* Value */}
      <motion.p
        className="text-2xl sm:text-3xl font-bold text-text-heading-light dark:text-text-heading-dark mb-0.5 tabular-nums"
        aria-label={`${title}: ${value.toLocaleString()}`}
      >
        {count.toLocaleString()}
      </motion.p>

      {/* Label */}
      <p className="text-xs text-text-para-light dark:text-text-para-dark">
        {title}
      </p>
    </motion.div>
  );
});

export default StatsCard;
