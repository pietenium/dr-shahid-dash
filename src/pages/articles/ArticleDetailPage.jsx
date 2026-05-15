/* eslint-disable no-unused-vars */
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faArrowLeft,
  faCalendar,
  faEye,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { getArticleBySlug } from "@api/article.api";
import { formatDate } from "@utils/formatDate";
import PageHeader from "@components/shared/PageHeader";
import Button from "@components/ui/Button";
import StatusBadge from "@components/shared/StatusBadge";
import Badge from "@components/ui/Badge";
import Spinner from "@components/ui/Spinner";

/**
 * ArticleDetailPage - Read-only preview of article
 * Fetches by ID param, displays full content with hero image
 */
function ArticleDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      // First fetch admin list to get the slug from ID
      const res = await getArticleBySlug(slug);
      const article = res.data;
      if (!article) throw new Error("Article not found");
      return article;
    },
  });

  const article = data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-2">Article Not Found</h2>
        <Button variant="primary" onClick={() => navigate("/articles")}>
          Back to Articles
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <PageHeader
        title={article.title}
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Articles", path: "/articles" },
          { label: article.title, active: true },
        ]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/articles")}
              leftIcon={faArrowLeft}
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/articles/${article._id}/edit`)}
              leftIcon={faEdit}
            >
              Edit
            </Button>
          </div>
        }
      />

      {/* Hero Image */}
      {article.featuredImage?.url && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-xl overflow-hidden max-h-96"
        >
          <img
            src={article.featuredImage.url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <h1 className="text-2xl font-bold text-white">{article.title}</h1>
          </div>
        </motion.div>
      )}

      {/* Metadata Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-3 p-4 bg-card-light dark:bg-card-dark rounded-xl border"
      >
        <Badge variant="default">
          {article.category?.name || "Uncategorized"}
        </Badge>
        <Badge variant={article.articleType === "MEDICAL" ? "info" : "purple"}>
          {article.articleType.toLowerCase()}
        </Badge>
        <StatusBadge status={article.status} />
        <span className="text-xs text-text-para-light flex items-center gap-1">
          <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
          {formatDate(article.publishedAt || article.createdAt, "MMM dd, yyyy")}
        </span>
        <span className="text-xs text-text-para-light flex items-center gap-1">
          <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
          {article.impressions} views
        </span>
        {article.author && (
          <span className="text-xs text-text-para-light">
            ✍️ {article.author}
          </span>
        )}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border p-6 sm:p-8"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* OG Image */}
      {article.ogImage?.url && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card-light dark:bg-card-dark rounded-xl border p-4"
        >
          <h3 className="text-sm font-semibold mb-2">Social Sharing Image</h3>
          <img
            src={article.ogImage.url}
            alt="OG"
            className="max-h-48 rounded-lg"
          />
        </motion.div>
      )}

      {/* Tags */}
      {article.tags?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2"
        >
          <FontAwesomeIcon
            icon={faTag}
            className="w-4 h-4 text-text-para-light"
          />
          {article.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full bg-brand-softbg dark:bg-brand-primary/10 text-brand-primary text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export default ArticleDetailPage;
