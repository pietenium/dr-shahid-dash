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
import { useEffect } from "react";

/**
 * ArticleDetailPage - Read-only preview of article
 * Fetches by slug param, displays full content with hero image, metadata, and tags
 * Provides buttons to go back to list or edit the article
 * Handles loading and error states gracefully
 */
/**
 * Editor styles for rendered TipTap HTML content
 * Mirrors the TipTap editor's visual output
 * @constant {string}
 */
const EDITOR_OUTPUT_CSS = `
  .tiptap-content { word-break: break-word; }
  .tiptap-content h1 { font-size: 2rem; font-weight: 700; margin: 1.5rem 0 0.75rem; line-height: 1.2; color: #1f2937; }
  .dark .tiptap-content h1 { color: #f8fafc; }
  .tiptap-content h2 { font-size: 1.5rem; font-weight: 600; margin: 1.25rem 0 0.5rem; line-height: 1.3; color: #1f2937; }
  .dark .tiptap-content h2 { color: #f8fafc; }
  .tiptap-content h3 { font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem; line-height: 1.4; color: #1f2937; }
  .dark .tiptap-content h3 { color: #f8fafc; }
  .tiptap-content p { margin: 0.5rem 0; line-height: 1.75; color: #374151; }
  .dark .tiptap-content p { color: #d1d5db; }
  .tiptap-content a { color: #2FA084; text-decoration: underline; transition: color 0.15s; }
  .tiptap-content a:hover { color: #267D68; }
  .tiptap-content strong { font-weight: 600; }
  .tiptap-content em { font-style: italic; }
  .tiptap-content s { text-decoration: line-through; }
  .tiptap-content u { text-decoration: underline; }
  .tiptap-content blockquote { border-left: 4px solid #578FCA; padding-left: 1rem; margin: 1rem 0; color: #6b7280; font-style: italic; }
  .dark .tiptap-content blockquote { color: #9ca3af; }
  .tiptap-content pre { background: #1f2937; color: #e5e7eb; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1rem 0; font-size: 0.875rem; }
  .tiptap-content code { background: #f3f4f6; padding: 0.15rem 0.4rem; border-radius: 0.25rem; font-size: 0.875em; font-family: 'Courier New', monospace; }
  .dark .tiptap-content code { background: #374151; color: #e5e7eb; }
  .tiptap-content pre code { background: transparent; padding: 0; border-radius: 0; color: inherit; }
  
  /* Lists */
  .tiptap-content ul { list-style-type: disc !important; padding-left: 1.5em !important; margin: 0.5em 0 !important; }
  .tiptap-content ul li { list-style-type: disc !important; display: list-item !important; padding-left: 0.25em !important; margin: 0.25em 0 !important; }
  .tiptap-content ul ul { list-style-type: circle !important; }
  .tiptap-content ul ul ul { list-style-type: square !important; }
  .tiptap-content ol { list-style-type: decimal !important; padding-left: 1.5em !important; margin: 0.5em 0 !important; }
  .tiptap-content ol li { list-style-type: decimal !important; display: list-item !important; padding-left: 0.25em !important; margin: 0.25em 0 !important; }
  .tiptap-content ol ol { list-style-type: lower-alpha !important; }
  .tiptap-content ol ol ol { list-style-type: lower-roman !important; }
  
  /* Images */
  .tiptap-content img { max-width: 100%; height: auto; border-radius: 0.75rem; margin: 1rem 0; }
  
  /* Horizontal rule */
  .tiptap-content hr { border: none; border-top: 2px solid #e5e7eb; margin: 2rem 0; }
  .dark .tiptap-content hr { border-color: #374151; }
  
  /* Tables */
  .tiptap-content table { border-collapse: collapse; width: 100%; margin: 1.5rem 0; overflow-x: auto; display: block; }
  .tiptap-content td, .tiptap-content th { border: 1px solid #d1d5db; padding: 10px 14px; min-width: 60px; vertical-align: top; }
  .dark .tiptap-content td, .dark .tiptap-content th { border-color: #374151; }
  .tiptap-content th { background: #f9fafb; font-weight: 600; text-align: left; }
  .dark .tiptap-content th { background: #1e293b; }
  
  /* Embeds */
  .tiptap-content .embed-wrapper { position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 10px; margin: 1.5rem 0; background: #000; }
  .tiptap-content .embed-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
  
  /* Text alignment */
  .tiptap-content [style*="text-align:center"] { text-align: center; }
  .tiptap-content [style*="text-align:right"] { text-align: right; }
  .tiptap-content [style*="text-align:justify"] { text-align: justify; }
`;
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

  useEffect(() => {
    const styleId = "tiptap-output-styles";
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.textContent = EDITOR_OUTPUT_CSS;
      document.head.appendChild(styleEl);
    }
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);
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
  /**
   * Inject TipTap editor styles for rendered HTML content
   * Ensures the detail page matches the editor's visual output
   */

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
              onClick={() => navigate(`/articles/${article.slug}/edit`)}
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
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border overflow-hidden"
      >
        <div
          className="tiptap-content p-6 sm:p-8"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </motion.div>

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
