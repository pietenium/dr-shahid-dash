/* eslint-disable no-unused-vars */
import { memo } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/**
 * Default brand color palette for pie charts
 */
const DEFAULT_COLORS = ["#2FA084", "#578FCA", "#6FCF97", "#A1E3F9", "#267D68"];

/**
 * Custom tooltip for pie chart
 */
const CustomTooltip = memo(function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const data = payload[0];
  const total = data.payload.total || 0;
  const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

  return (
    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg shadow-lg p-3">
      <p className="text-xs font-medium text-text-heading-light dark:text-text-heading-dark mb-1">
        {data.name}
      </p>
      <p className="text-xs font-semibold" style={{ color: data.payload.fill }}>
        {data.value.toLocaleString()} ({percentage}%)
      </p>
    </div>
  );
});

/**
 * Custom legend renderer
 */
const renderLegend = (props) => {
  const { payload } = props;
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-3">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-text-para-light dark:text-text-para-dark truncate max-w-[100px]">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/**
 * PieChartCard - Reusable donut/pie chart wrapper with card styling
 * Responsive, animated, dark mode aware
 *
 * @param {Object} props
 * @param {Array<{name: string, value: number}>} props.data - Chart data array
 * @param {string} props.title - Card title
 * @param {string[]} [props.colors] - Array of hex color strings
 * @param {number} [props.height=300] - Chart height in pixels
 * @param {boolean} [props.loading=false] - Show skeleton loader
 * @param {boolean} [props.donut=true] - Render as donut chart
 * @param {string} [props.subtitle] - Optional subtitle
 */
const PieChartCard = memo(function PieChartCard({
  data = [],
  title,
  colors = DEFAULT_COLORS,
  height = 300,
  loading = false,
  donut = true,
  subtitle,
}) {
  // Calculate total for percentage display
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const enrichedData = data.map((item) => ({
    ...item,
    total,
    fill: colors[data.indexOf(item) % colors.length],
  }));

  // Skeleton loader
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5"
      >
        <div className="skeleton h-5 w-32 rounded mb-2" />
        <div className="skeleton h-4 w-48 rounded mb-4" />
        <div
          className="skeleton rounded-full mx-auto"
          style={{ width: `${height * 0.7}px`, height: `${height * 0.7}px` }}
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
      <div className="mb-2">
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
        <PieChart>
          <Pie
            data={enrichedData}
            cx="50%"
            cy="50%"
            innerRadius={donut ? 55 : 0}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {enrichedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
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

export default PieChartCard;
