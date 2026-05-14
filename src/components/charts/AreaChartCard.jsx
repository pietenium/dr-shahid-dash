/* eslint-disable no-unused-vars */
import { memo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Custom tooltip styled with brand colors
 */
const CustomTooltip = memo(function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg shadow-lg p-3">
      <p className="text-xs font-medium text-text-heading-light dark:text-text-heading-dark mb-1">
        {label}
      </p>
      {payload.map((entry, index) => (
        <p
          key={index}
          className="text-xs font-semibold"
          style={{ color: entry.color }}
        >
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
});

/**
 * AreaChartCard - Reusable area chart with gradient fill
 * Responsive, animated, dark mode aware
 *
 * @param {Object} props
 * @param {Array<Object>} props.data - Chart data array
 * @param {string} props.dataKey - Key for area values
 * @param {string} props.xKey - Key for x-axis labels
 * @param {string} props.title - Card title
 * @param {string} [props.color='#2FA084'] - Area fill color
 * @param {number} [props.height=300] - Chart height in pixels
 * @param {string} [props.subtitle] - Optional subtitle
 * @param {boolean} [props.loading=false] - Show skeleton loader
 */
const AreaChartCard = memo(function AreaChartCard({
  data = [],
  dataKey,
  xKey,
  title,
  color = "#2FA084",
  height = 300,
  subtitle,
  loading = false,
}) {
  const gradientId = `area-gradient-${title.replace(/\s+/g, "-")}`;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5"
      >
        <div className="skeleton h-5 w-40 rounded mb-2" />
        <div className="skeleton h-4 w-60 rounded mb-4" />
        <div
          className="skeleton rounded-lg"
          style={{ height: `${height}px` }}
        />
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
      <div className="mb-4">
        <h3 className="text-base font-semibold text-text-heading-light dark:text-text-heading-dark">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-text-para-light dark:text-text-para-dark mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-border-light dark:text-border-dark"
            opacity={0.3}
            vertical={false}
          />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 10, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>

      {data.length === 0 && (
        <div
          className="flex items-center justify-center"
          style={{ height: `${height}px` }}
        >
          <p className="text-sm text-text-para-light dark:text-text-para-dark">
            No data available
          </p>
        </div>
      )}
    </motion.div>
  );
});

export default AreaChartCard;
