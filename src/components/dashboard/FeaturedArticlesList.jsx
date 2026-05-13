/* eslint-disable no-unused-vars */
import { memo } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileText,
  faArrowRight,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import Badge from "@components/ui/Badge";

/**
 * Article type badge color mapping
 */
const articleTypeColors = {
  medical: "info",
  political: "purple",
};

/**
 * FeaturedArticlesList - Mini-list of featured articles for dashboard
 * Shows title, type badge, and impressions count
 *
 * @param {Object} props
 * @param {Array<Object>} props.articles - Article data array
 * @param {boolean} [props.loading=false] - Show skeleton loader
 */
const FeaturedArticlesList = memo(function FeaturedArticlesList({
  articles = [],
  loading = false,
}) {
  // Skeleton loader
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5"
      >
        <div className="skeleton h-5 w-36 rounded mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-3 border-b border-border-light dark:border-border-dark last:border-0"
          >
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-4 w-full rounded" />
              <div className="flex gap-2">
                <div className="skeleton h-5 w-16 rounded-full" />
                <div className="skeleton h-4 w-12 rounded" />
              </div>
            </div>
          </div>
        ))}
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon
            icon={faFileText}
            className="w-4 h-4 text-brand-primary"
          />
          <h3 className="text-base font-semibold text-text-heading-light dark:text-text-heading-dark">
            Featured Articles
          </h3>
        </div>
        <Link
          to="/articles"
          className="text-xs text-brand-primary hover:text-brand-hover transition-colors flex items-center gap-1 font-medium"
        >
          View All
          <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
        </Link>
      </div>

      {/* Articles List */}
      <div className="space-y-0">
        {articles.map((article, index) => (
          <motion.div
            key={article._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-3 py-2.5 border-b border-border-light dark:border-border-dark last:border-0"
          >
            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-heading-light dark:text-text-heading-dark truncate">
                {article.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={articleTypeColors[article.articleType] || "default"}
                  className="text-[10px]"
                >
                  {article.articleType}
                </Badge>
                <span className="flex items-center gap-1 text-[10px] text-text-para-light dark:text-text-para-dark">
                  <FontAwesomeIcon icon={faEye} className="w-2.5 h-2.5" />
                  {article.impressions?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Empty State */}
        {articles.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-text-para-light dark:text-text-para-dark">
              No featured articles
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default FeaturedArticlesList;
