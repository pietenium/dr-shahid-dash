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
  faFilePdf,
  faLink,
  faCalendar,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { getResearchList, deleteResearch } from "@api/research.api";
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

/**
 * ResearchPage - Research papers listing with filterable card grid
 * Features: Search, status filter, upload type filter, pagination
 */
function ResearchPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { page, limit, goToPage, paginationParams } = usePagination({
    initialLimit: 9,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  const queryParams = useMemo(
    () => ({
      ...paginationParams,
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      uploadType: typeFilter || undefined,
    }),
    [paginationParams, debouncedSearch, statusFilter, typeFilter],
  );

  const { data: researchData, isLoading } = useQuery({
    queryKey: ["research", queryParams],
    queryFn: () => getResearchList(queryParams),
    staleTime: 2 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResearch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research"] });
      toast.success("Research paper deleted");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete research paper"),
  });

  const papers = researchData?.data || [];
  const pagination = researchData?.meta || {};
  const hasActiveFilters = statusFilter || typeFilter || search;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <PageHeader
        title="Research Papers"
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Research", active: true },
        ]}
        actions={
          <Button
            variant="primary"
            leftIcon={faPlus}
            onClick={() => navigate("/research/create")}
          >
            Add Research
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
              placeholder="Search research papers..."
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
            <option value="PDF">PDF</option>
            <option value="DOI">DOI</option>
          </select>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setTypeFilter("");
                goToPage(1);
              }}
              className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </motion.div>

      {/* Research Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-[340px] rounded-xl" />
          ))}
        </div>
      ) : papers.length === 0 ? (
        <EmptyState
          title="No research papers found"
          description={
            hasActiveFilters
              ? "Try adjusting your filters"
              : "Add your first research paper"
          }
          action={
            !hasActiveFilters ? (
              <Button
                variant="primary"
                onClick={() => navigate("/research/create")}
              >
                Add Research
              </Button>
            ) : null
          }
        />
      ) : (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {papers.map((paper, index) => (
            <ResearchCard
              key={paper._id}
              paper={paper}
              index={index}
              onView={() => navigate(`/research/${paper._id}`)}
              onEdit={() => navigate(`/research/${paper._id}/edit`)}
              onDelete={() => setDeleteTarget(paper)}
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
        title="Delete Research Paper"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </motion.div>
  );
}

/**
 * ResearchCard - Individual research paper card
 */
const ResearchCard = ({ paper, index, onView, onEdit, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.08)" }}
    className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden transition-shadow flex flex-col"
  >
    {/* Thumbnail Area */}
    <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-750 flex items-center justify-center relative">
      {paper.thumbnailImage?.url ? (
        <img
          src={paper.thumbnailImage.url}
          alt={paper.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <FontAwesomeIcon
          icon={paper.uploadType === "PDF" ? faFilePdf : faLink}
          className={`w-12 h-12 ${paper.uploadType === "PDF" ? "text-red-400" : "text-blue-400"}`}
        />
      )}
    </div>

    <div className="p-4 flex flex-col flex-1 gap-2">
      {/* Badges */}
      <div className="flex gap-1.5 flex-wrap">
        <Badge
          variant={paper.uploadType === "PDF" ? "danger" : "info"}
          className="text-[10px]"
        >
          {paper.uploadType === "PDF" ? "📄 PDF" : "🔗 DOI"}
        </Badge>
        <StatusBadge status={paper.status} />
      </div>

      {/* Title */}
      <h3 className="font-semibold text-text-heading-light dark:text-text-heading-dark line-clamp-2 text-sm">
        {paper.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-text-para-light dark:text-text-para-dark line-clamp-3 flex-1">
        {paper.description || "No description"}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border-light dark:border-border-dark">
        <span className="text-[10px] text-text-para-light flex items-center gap-1">
          <FontAwesomeIcon icon={faCalendar} className="w-2.5 h-2.5" />
          {formatDate(paper.publishedAt || paper.createdAt, "MMM dd, yyyy")}
        </span>
      </div>

      {/* Actions */}
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

export default ResearchPage;
