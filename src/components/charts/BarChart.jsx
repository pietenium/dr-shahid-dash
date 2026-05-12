/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Custom tooltip for BarChart - defined OUTSIDE to prevent re-creation on each render
 * @param {Object} props - Recharts tooltip props
 * @param {boolean} props.active - Whether tooltip is active
 * @param {Array} props.payload - Tooltip payload data
 * @param {string} props.label - X-axis label value
 * @returns {JSX.Element|null} Tooltip element or null
 */
function BarChartTooltip({ active, payload, label }) {
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
            style={{ color: entry.color || "#578FCA" }}
          >
            {entry.name || "Value"}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

/**
 * Reusable Bar Chart card component supporting vertical and horizontal layouts
 * @param {Object} props
 * @param {Array<Object>} props.data - Chart data array
 * @param {string} props.dataKey - Key in data object for bar values
 * @param {string} [props.xKey='date'] - Key in data object for X-axis (or Y-axis if horizontal)
 * @param {string} props.title - Card title displayed above chart
 * @param {string} [props.color='#578FCA'] - Bar fill color (hex)
 * @param {number} [props.height=300] - Chart height in pixels
 * @param {boolean} [props.horizontal=false] - Whether to render as horizontal bar chart
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.loading=false] - Whether to show loading skeleton
 */
function BarChartCard({
  data = [],
  dataKey,
  xKey = "date",
  title,
  color = "#578FCA",
  height = 300,
  horizontal = false,
  className = "",
  loading = false,
}) {
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
        <RechartsBarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 5, right: 5, left: horizontal ? 0 : -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E7EB"
            className="dark:opacity-10"
            horizontal={!horizontal}
            vertical={horizontal}
          />
          {horizontal ? (
            <>
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey={xKey}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickLine={false}
                axisLine={false}
                width={120}
              />
            </>
          ) : (
            <>
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
            </>
          )}
          <Tooltip content={<BarChartTooltip />} />
          <Bar
            dataKey={dataKey}
            name={dataKey}
            fill={color}
            radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            isAnimationActive={true}
            animationDuration={1000}
            barSize={horizontal ? 20 : undefined}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export default BarChartCard;
