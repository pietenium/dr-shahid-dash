/* eslint-disable no-unused-vars */
import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faEye,
  faEdit,
  faTrash,
  faImage,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { getArticles, deleteArticle, getCategories } from "@api/article.api";
import { useDebounce } from "@hooks/useDebounce";
import { usePagination } from "@hooks/usePagination";
import { formatDate } from "@utils/formatDate";
import PageHeader from "@components/shared/PageHeader";
import Button from "@components/ui/Button";
import StatusBadge from "@components/shared/StatusBadge";
import Badge from "@components/ui/Badge";
import Pagination from "@components/ui/Pagination";
import ConfirmDialog from "@components/ui/ConfirmDialog";
import EmptyState from "@components/ui/EmptyState";
import { toast } from "sonner";

const articleTypeColors = { MEDICAL: "info", POLITICAL: "purple" };
const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

/**
 * ArticlesPage - Article listing with filterable card grid
 */
function ArticlesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { page, limit, goToPage, paginationParams } = usePagination({
    initialLimit: 9,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  const queryParams = useMemo(
    () => ({
      ...paginationParams,
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      articleType: typeFilter || undefined,
      category: categoryFilter || undefined,
      sort: sort || undefined,
    }),
    [
      paginationParams,
      debouncedSearch,
      statusFilter,
      typeFilter,
      categoryFilter,
      sort,
    ],
  );

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ["articles", "admin", queryParams],
    queryFn: () => getArticles(queryParams),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success("Article deleted");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete article"),
  });

  const articles = articlesData?.data || [];
  const pagination = articlesData?.meta || {};
  const categories = categoriesData?.data || [];

  const hasActiveFilters =
    statusFilter || typeFilter || categoryFilter || search;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <PageHeader
        title="Articles"
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Articles", active: true },
        ]}
        actions={
          <Button
            variant="primary"
            leftIcon={faPlus}
            onClick={() => navigate("/articles/create")}
          >
            Create Article
          </Button>
        }
      />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-para-light"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                goToPage(1);
              }}
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] text-sm text-text-heading-light dark:text-text-heading-dark placeholder:text-text-para-light focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              goToPage(1);
            }}
            className="px-3 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] text-sm text-text-heading-light dark:text-text-heading-dark focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              goToPage(1);
            }}
            className="px-3 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] text-sm text-text-heading-light dark:text-text-heading-dark focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="">All Types</option>
            <option value="MEDICAL">Medical</option>
            <option value="POLITICAL">Political</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              goToPage(1);
            }}
            className="px-3 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] text-sm text-text-heading-light dark:text-text-heading-dark focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] text-sm text-text-heading-light dark:text-text-heading-dark"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setTypeFilter("");
                setCategoryFilter("");
                goToPage(1);
              }}
              className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </motion.div>

      {/* Article Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-[380px] rounded-xl" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          title="No articles found"
          description={
            hasActiveFilters
              ? "Try adjusting your filters"
              : "Create your first article"
          }
          action={
            !hasActiveFilters ? (
              <Button
                variant="primary"
                onClick={() => navigate("/articles/create")}
              >
                Create Article
              </Button>
            ) : null
          }
        />
      ) : (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article, index) => (
            <ArticleCard
              key={article._id}
              article={article}
              index={index}
              onView={() => navigate(`/articles/${article?.slug}`)}
              onEdit={() => navigate(`/articles/${article._id}/edit`)}
              onDelete={() => setDeleteTarget(article)}
            />
          ))}
        </motion.div>
      )}

      {pagination.totalPage > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPage}
          totalDocs={pagination.total}
          limit={limit}
          onPageChange={goToPage}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        title="Delete Article"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </motion.div>
  );
}

/** Article Card Component */
const ArticleCard = ({ article, index, onView, onEdit, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.08)" }}
    className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden transition-shadow"
  >
    <div className="h-44 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 dark:from-brand-primary/10 dark:to-brand-secondary/10 flex items-center justify-center">
      {article.featuredImage?.url ? (
        <img
          src={article.featuredImage.url}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <FontAwesomeIcon
          icon={faImage}
          className="w-10 h-10 text-brand-primary/30"
        />
      )}
    </div>
    <div className="p-4 flex flex-col flex-1 gap-2">
      <div className="flex gap-1.5 flex-wrap">
        <Badge variant="default" className="text-[10px]">
          {article.category?.name || "Uncategorized"}
        </Badge>
        <Badge
          variant={articleTypeColors[article.articleType] || "default"}
          className="text-[10px]"
        >
          {article.articleType.toLowerCase()}
        </Badge>
      </div>
      <h3 className="font-semibold text-text-heading-light dark:text-text-heading-dark line-clamp-2 text-sm">
        {article.title}
      </h3>
      <p className="text-xs text-text-para-light dark:text-text-para-dark line-clamp-3 flex-1">
        {article.excerpt || "No excerpt"}
      </p>
      <div className="flex items-center justify-between pt-2 border-t border-border-light dark:border-border-dark">
        <div className="flex items-center gap-2 text-[10px] text-text-para-light">
          <span>
            {formatDate(article.publishedAt || article.createdAt, "MMM dd")}
          </span>
          <span>•</span>
          <span>👁 {article.impressions}</span>
        </div>
        <StatusBadge status={article.status} />
      </div>
      <div className="flex items-center gap-1 pt-1">
        <button
          onClick={onView}
          className="flex-1 py-1.5 rounded-lg text-xs text-brand-primary hover:bg-brand-softbg dark:hover:bg-brand-primary/10 transition-colors"
          title="View"
        >
          <FontAwesomeIcon icon={faEye} /> View
        </button>
        <button
          onClick={onEdit}
          className="flex-1 py-1.5 rounded-lg text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          title="Edit"
        >
          <FontAwesomeIcon icon={faEdit} /> Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Delete"
        >
          <FontAwesomeIcon icon={faTrash} /> Delete
        </button>
      </div>
    </div>
  </motion.div>
);

export default ArticlesPage;
