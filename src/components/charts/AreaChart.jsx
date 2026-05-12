/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { useId } from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Custom tooltip for AreaChart - defined OUTSIDE to prevent re-creation on each render
 * @param {Object} props - Recharts tooltip props
 * @param {boolean} props.active - Whether tooltip is active
 * @param {Array} props.payload - Tooltip payload data
 * @param {string} props.label - X-axis label value
 * @returns {JSX.Element|null} Tooltip element or null
 */
function AreaChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card-light dark:bg-card-dark p-3 rounded-lg shadow-lg border border-border-light dark:border-border-dark">
        <p className="text-xs text-text-para-light dark:text-text-para-dark mb-1">
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="text-sm font-semibold"
            style={{ color: entry.color || "#2FA084" }}
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

/**
 * Reusable Area Chart card component with gradient fill
 * @param {Object} props
 * @param {Array<Object>} props.data - Chart data array
 * @param {string} props.dataKey - Key in data object for area values
 * @param {string} [props.xKey='date'] - Key in data object for X-axis values
 * @param {string} props.title - Card title displayed above chart
 * @param {string} [props.color='#2FA084'] - Area stroke/fill color (hex)
 * @param {number} [props.height=300] - Chart height in pixels
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.loading=false] - Whether to show loading skeleton
 */
function AreaChartCard({
  data = [],
  dataKey,
  xKey = "date",
  title,
  color = "#2FA084",
  height = 300,
  className = "",
  loading = false,
}) {
  // Generate unique gradient ID per chart instance
  const uniqueId = useId();
  const gradientId = `areaGradient-${dataKey}-${uniqueId}`;
  /**Error: Cannot call impure function during render

`Math.random` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

  64 | }) {
  65 |   // Generate unique gradient ID per chart instance
> 66 |   const gradientId = `areaGradient-${dataKey}-${Math.random().toString(36).substr(2, 9)}`;
     |                                                 ^^^^^^^^^^^^^ Cannot call impure function
  67 |
  68 |   if (loading) {
  69 |     return ( */

  if (loading) {
    return (
      <div
        className={`bg-card-light dark:bg-card-dark rounded-xl shadow-sm p-6 border border-border-light dark:border-border-dark ${className}`}
      >
        <div className="h-5 w-32 skeleton rounded mb-4" />
        <div className="skeleton rounded" style={{ height: `${height}px` }} />
      </div>
    );
  }

  if (!data.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-card-light dark:bg-card-dark rounded-xl shadow-sm p-6 border border-border-light dark:border-border-dark ${className}`}
      >
        <h3 className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark mb-4">
          {title}
        </h3>
        <div
          className="flex items-center justify-center"
          style={{ height: `${height}px` }}
        >
          <p className="text-text-para-light dark:text-text-para-dark text-sm">
            No data available
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-card-light dark:bg-card-dark
        rounded-xl shadow-sm
        border border-border-light dark:border-border-dark
        p-6
        ${className}
      `.trim()}
    >
      <h3 className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark mb-4">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart
          data={data}
          margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E7EB"
            className="dark:opacity-10"
            vertical={false}
          />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6B7280" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<AreaChartTooltip />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            name={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={true}
            animationDuration={1000}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export default AreaChartCard;
