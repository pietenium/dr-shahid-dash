/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/**
 * Custom tooltip for PieChart - defined OUTSIDE component to prevent re-creation
 * @param {Object} props - Recharts tooltip props
 * @param {boolean} props.active - Whether tooltip is active
 * @param {Array} props.payload - Tooltip payload data
 * @returns {JSX.Element|null} Tooltip element or null
 */
function PieChartTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const total =
      payload[0]?.payload?.total ||
      payload.reduce((sum, item) => sum + (item.value || 0), 0);
    const value = payload[0]?.value || 0;
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";

    return (
      <div className="bg-card-light dark:bg-card-dark p-3 rounded-lg shadow-lg border border-border-light dark:border-border-dark">
        <p className="text-xs text-text-para-light dark:text-text-para-dark">
          {payload[0]?.name}
        </p>
        <p
          className="text-sm font-semibold"
          style={{ color: payload[0]?.color }}
        >
          {value} ({percentage}%)
        </p>
      </div>
    );
  }
  return null;
}

/**
 * Reusable Pie Chart card component
 * @param {Object} props
 * @param {Array<{name: string, value: number}>} props.data - Chart data array with name and value
 * @param {string} props.title - Card title displayed above chart
 * @param {string[]} [props.colors] - Array of hex colors for pie slices (defaults to brand palette)
 * @param {number} [props.height=300] - Chart height in pixels
 * @param {boolean} [props.showLegend=true] - Whether to show legend below chart
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.loading=false] - Loading state shows skeleton
 */
function PieChartCard({
  data = [],
  title,
  colors = ["#2FA084", "#578FCA", "#6FCF97", "#A1E3F9", "#1F2937"],
  height = 300,
  showLegend = true,
  className = "",
  loading = false,
}) {
  // Calculate total for percentage display
  const totalValue = data.reduce((sum, item) => sum + (item.value || 0), 0);

  // Add total to each data item for tooltip reference
  const enrichedData = data.map((item) => ({
    ...item,
    total: totalValue,
  }));

  if (loading) {
    return (
      <div
        className={`bg-card-light dark:bg-card-dark rounded-xl shadow-sm p-6 border border-border-light dark:border-border-dark ${className}`}
      >
        <div className="h-5 w-32 skeleton rounded mb-4" />
        <div
          className="skeleton rounded-full mx-auto"
          style={{ width: `${height * 0.6}px`, height: `${height * 0.6}px` }}
        />
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
        <RechartsPieChart>
          <Pie
            data={enrichedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            isAnimationActive={true}
            animationDuration={1000}
          >
            {enrichedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<PieChartTooltip />} />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value) => (
                <span className="text-xs text-text-para-light dark:text-text-para-dark">
                  {value}
                </span>
              )}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export default PieChartCard;
