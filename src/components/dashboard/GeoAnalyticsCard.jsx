/* eslint-disable no-unused-vars */
import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import PieChartCard from "@components/charts/PieChartCard";

/**
 * Country flag emoji mapping for top countries
 * @constant {Object.<string, string>}
 */
const COUNTRY_FLAGS = {
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  Germany: "🇩🇪",
  France: "🇫🇷",
  India: "🇮🇳",
  Brazil: "🇧🇷",
  Japan: "🇯🇵",
  Bangladesh: "🇧🇩",
  Singapore: "🇸🇬",
  Malaysia: "🇲🇾",
  Indonesia: "🇮🇩",
  Philippines: "🇵🇭",
  Thailand: "🇹🇭",
  Vietnam: "🇻🇳",
  "South Korea": "🇰🇷",
  China: "🇨🇳",
  Russia: "🇷🇺",
  Italy: "🇮🇹",
  Spain: "🇪🇸",
  Netherlands: "🇳🇱",
  Sweden: "🇸🇪",
  Norway: "🇳🇴",
  Denmark: "🇩🇰",
  Finland: "🇫🇮",
  Switzerland: "🇨🇭",
  Austria: "🇦🇹",
  Belgium: "🇧🇪",
  Portugal: "🇵🇹",
  Mexico: "🇲🇽",
  Argentina: "🇦🇷",
  Colombia: "🇨🇴",
  Chile: "🇨🇱",
  Peru: "🇵🇪",
  "South Africa": "🇿🇦",
  Egypt: "🇪🇬",
  Nigeria: "🇳🇬",
  Kenya: "🇰🇪",
  Ghana: "🇬🇭",
  Morocco: "🇲🇦",
  Turkey: "🇹🇷",
  UAE: "🇦🇪",
  "Saudi Arabia": "🇸🇦",
  Qatar: "🇶🇦",
  Kuwait: "🇰🇼",
  Oman: "🇴🇲",
  Bahrain: "🇧🇭",
  Pakistan: "🇵🇰",
  "Sri Lanka": "🇱🇰",
  Nepal: "🇳🇵",
  Myanmar: "🇲🇲",
  Unknown: "🌍",
};

/**
 * Get flag emoji for country name
 * @param {string} country - Country name
 * @returns {string} Flag emoji or globe
 */
function getFlag(country) {
  return COUNTRY_FLAGS[country] || "🌍";
}

/**
 * GeoAnalyticsCard - Full-width card showing visitor geography
 * Left side: Ranked country list with progress bars
 * Right side: Pie chart of top 5 countries
 *
 * @param {Object} props
 * @param {Array<{_id: string, count: number, country: string}>} props.geoData - Geo stats data
 * @param {boolean} [props.loading=false] - Show skeleton loader
 */
const GeoAnalyticsCard = memo(function GeoAnalyticsCard({
  geoData = [],
  loading = false,
}) {
  // Top 10 for list, top 5 for pie chart
  const top10 = useMemo(() => geoData.slice(0, 10), [geoData]);
  const top5Pie = useMemo(
    () =>
      geoData.slice(0, 5).map((item) => ({
        name: item._id || item.country || "Unknown",
        value: item.count,
      })),
    [geoData],
  );

  // Max count for progress bar calculation
  const maxCount = useMemo(
    () => (top10.length > 0 ? top10[0].count : 1),
    [top10],
  );

  // Skeleton loader
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5"
      >
        <div className="skeleton h-5 w-40 rounded mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton w-6 h-5 rounded" />
                <div className="skeleton h-4 flex-1 rounded" />
                <div className="skeleton h-3 w-12 rounded" />
              </div>
            ))}
          </div>
          <div
            className="skeleton rounded-full mx-auto"
            style={{ width: "200px", height: "200px" }}
          />
        </div>
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
      <h3 className="text-base font-semibold text-text-heading-light dark:text-text-heading-dark mb-5">
        🌍 Visitor Geography
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Country List with Progress Bars */}
        <div className="space-y-3">
          {top10.map((item, index) => (
            <motion.div
              key={item._id || index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3"
            >
              {/* Rank */}
              <span className="text-xs font-medium text-text-para-light dark:text-text-para-dark w-5 text-right shrink-0">
                {index + 1}
              </span>

              {/* Flag */}
              <span
                className="text-lg shrink-0"
                role="img"
                aria-label={item._id || "Unknown"}
              >
                {getFlag(item._id)}
              </span>

              {/* Country Name & Progress Bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text-heading-light dark:text-text-heading-dark truncate">
                    {item._id || "Unknown"}
                  </span>
                  <span className="text-xs text-text-para-light dark:text-text-para-dark ml-2 shrink-0">
                    {item.count.toLocaleString()}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / maxCount) * 100}%` }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.05,
                      ease: "easeOut",
                    }}
                    className="h-full bg-linear-to-r from-brand-primary to-brand-accent rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          ))}

          {top10.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-text-para-light dark:text-text-para-dark">
                No geographic data available
              </p>
            </div>
          )}
        </div>

        {/* Right: Pie Chart */}
        <div className="flex items-center justify-center">
          <PieChartCard
            data={top5Pie}
            title=""
            height={260}
            donut={true}
            colors={["#2FA084", "#578FCA", "#6FCF97", "#A1E3F9", "#267D68"]}
          />
        </div>
      </div>
    </motion.div>
  );
});

export default GeoAnalyticsCard;
