/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/**
 * Custom tooltip for LineChart - defined OUTSIDE to prevent re-creation on each render
 * @param {Object} props - Recharts tooltip props
 * @param {boolean} props.active - Whether tooltip is active
 * @param {Array} props.payload - Tooltip payload data
 * @param {string} props.label - X-axis label value
 * @returns {JSX.Element|null} Tooltip element or null
 */
function LineChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card-light dark:bg-card-dark p-3 rounded-lg shadow-lg border border-border-light dark:border-border-dark">
        <p className="text-xs text-text-para-light dark:text-text-para-dark mb-2">
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="text-sm font-medium"
            style={{ color: entry.color }}
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
 * Reusable Line Chart card component with multiple line support
 * @param {Object} props
 * @param {Array<Object>} props.data - Chart data array
 * @param {Array<{key: string, color: string, name?: string}>} props.lines - Line configurations with data key, color, and optional display name
 * @param {string} [props.xKey='date'] - Key in data object for X-axis values
 * @param {string} props.title - Card title displayed above chart
 * @param {number} [props.height=300] - Chart height in pixels
 * @param {boolean} [props.showLegend=true] - Whether to show legend
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.loading=false] - Whether to show loading skeleton
 */
function LineChartCard({
  data = [],
  lines = [],
  xKey = "date",
  title,
  height = 300,
  showLegend = true,
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

  if (!data.length || !lines.length) {
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
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
        >
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
          <Tooltip content={<LineChartTooltip />} />
          {showLegend && (
            <Legend
              verticalAlign="top"
              height={30}
              iconType="line"
              formatter={(value) => (
                <span className="text-xs text-text-para-light dark:text-text-para-dark">
                  {value}
                </span>
              )}
            />
          )}
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name || line.key}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={true}
              animationDuration={1000}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export default LineChartCard;
