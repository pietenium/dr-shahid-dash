/* eslint-disable no-unused-vars */
import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

/**
 * Custom tooltip for chart components
 * Styled with brand colors and dark mode support
 * @param {Object} props - Recharts tooltip props
 * @param {boolean} props.active - Whether tooltip is active
 * @param {Array} props.payload - Tooltip data payload
 * @param {string} props.label - Tooltip label
 * @returns {JSX.Element|null} Custom tooltip or null
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
 * BarChartCard - Reusable bar chart wrapper with card styling
 * Responsive, animated, dark mode aware
 *
 * @param {Object} props
 * @param {Array<Object>} props.data - Chart data array
 * @param {string} props.dataKey - Key for bar values
 * @param {string} props.xKey - Key for x-axis labels
 * @param {string} props.title - Card title
 * @param {string} [props.color='#2FA084'] - Bar fill color
 * @param {number} [props.height=300] - Chart height in pixels
 * @param {string} [props.subtitle] - Optional subtitle
 * @param {boolean} [props.loading=false] - Show skeleton loader
 * @param {boolean} [props.horizontal=false] - Render horizontal bar chart
 */
const BarChartCard = memo(function BarChartCard({
  data = [],
  dataKey,
  xKey,
  title,
  color = "#2FA084",
  height = 300,
  subtitle,
  loading = false,
  horizontal = false,
}) {
  /**
   * Format x-axis tick label
   * Shortens long labels for better display
   */
  const formatXAxisTick = (value) => {
    if (!value) return "";
    return value.length > 12 ? value.substring(0, 11) + "…" : value;
  };

  /**
   * Generate gradient ID for bar fill
   */
  const gradientId = useMemo(
    () => `bar-gradient-${title.replace(/\s+/g, "-")}`,
    [title],
  );

  // Skeleton loader
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
      {/* Card Header */}
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

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        {horizontal ? (
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={color} stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-border-light dark:text-border-dark"
              opacity={0.3}
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
              width={120}
              tickFormatter={formatXAxisTick}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey={dataKey}
              fill={`url(#${gradientId})`}
              radius={[0, 4, 4, 0]}
              barSize={20}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        ) : (
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.6} />
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
              tickFormatter={formatXAxisTick}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey={dataKey}
              fill={`url(#${gradientId})`}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        )}
      </ResponsiveContainer>

      {/* Empty State */}
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

export default BarChartCard;
