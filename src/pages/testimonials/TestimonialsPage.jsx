/* eslint-disable no-unused-vars */
import { useState, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEye,
  faEdit,
  faTrash,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import {
  getTestimonials,
  updateTestimonial,
  deleteTestimonial,
} from "@api/testimonial.api";
import PageHeader from "@components/shared/PageHeader";
import Button from "@components/ui/Button";
import StarRating from "@components/testimonials/StarRating";
import TestimonialDetailModal from "@components/testimonials/TestimonialDetailModal";
import ConfirmDialog from "@components/ui/ConfirmDialog";
import EmptyState from "@components/ui/EmptyState";
import { toast } from "sonner";

/**
 * Filter tab configuration - static constant (no re-creation)
 * @constant {Array<{label: string, value: string}>}
 */
const FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Visible", value: "visible" },
  { label: "Hidden", value: "hidden" },
];

/**
 * Skeleton array - created once outside component
 */
const SKELETON_ITEMS = [1, 2, 3, 4, 5, 6];

/**
 * DSA: Pre-compute filter counts using reduce (O(n)) instead of multiple filter() calls (O(3n))
 * @param {Array} testimonials - Full testimonials array
 * @param {string} activeFilter - Current active filter
 * @returns {{ all: number, visible: number, hidden: number, filtered: Array }}
 */
function computeFilteredData(testimonials, activeFilter) {
  // Single pass O(n) to compute all counts + filtered array
  let all = 0;
  let visible = 0;
  let hidden = 0;
  const filtered = [];

  for (let i = 0; i < testimonials.length; i++) {
    const t = testimonials[i];
    all++;
    if (t.isVisible) {
      visible++;
      if (activeFilter === "all" || activeFilter === "visible") {
        filtered.push(t);
      }
    } else {
      hidden++;
      if (activeFilter === "all" || activeFilter === "hidden") {
        filtered.push(t);
      }
    }
  }

  return { all, visible, hidden, filtered };
}

/**
 * TestimonialsPage - Optimized with DSA for performance
 */
function TestimonialsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: getTestimonials,
    staleTime: 5 * 60 * 1000, // Increased to 5 min - testimonials don't change often
    gcTime: 10 * 60 * 1000,
  });

  const testimonials = useMemo(() => data?.data || [], [data]);

  /**
   * DSA Optimization: Single O(n) pass instead of multiple filter() calls
   * Computes counts AND filtered array in one iteration
   */
  const { filtered, counts } = useMemo(() => {
    const result = computeFilteredData(testimonials, visibilityFilter);
    return {
      filtered: result.filtered,
      counts: {
        all: result.all,
        visible: result.visible,
        hidden: result.hidden,
      },
    };
  }, [testimonials, visibilityFilter]);

  const toggleMutation = useMutation({
    mutationFn: ({ id, isVisible }) => {
      const fd = new FormData();
      fd.append("isVisible", isVisible.toString());
      return updateTestimonial(id, fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Visibility updated");
    },
    onError: () => toast.error("Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("Testimonial deleted");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete"),
  });

  /**
   * Memoized handlers to prevent re-creation on every render
   */
  const handleViewDetail = useCallback((testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
  }, []);

  const handleToggleVisibility = useCallback(
    (testimonial, e) => {
      e.stopPropagation();
      toggleMutation.mutate({
        id: testimonial._id,
        isVisible: !testimonial.isVisible,
      });
    },
    [toggleMutation],
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTestimonial(null);
  }, []);

  const handleEditFromModal = useCallback(() => {
    if (selectedTestimonial) {
      setIsModalOpen(false);
      navigate(`/testimonials/${selectedTestimonial._id}/edit`);
    }
  }, [selectedTestimonial, navigate]);

  const handleDeleteFromModal = useCallback(() => {
    if (selectedTestimonial) {
      setIsModalOpen(false);
      setDeleteTarget(selectedTestimonial);
    }
  }, [selectedTestimonial]);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget._id);
    }
  }, [deleteTarget, deleteMutation]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <PageHeader
        title="Testimonials"
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Testimonials", active: true },
        ]}
        actions={
          <Button
            variant="primary"
            leftIcon={faPlus}
            onClick={() => navigate("/testimonials/create")}
          >
            Add Testimonial
          </Button>
        }
      />

      {/* Visibility Filter */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-1"
      >
        {FILTER_TABS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setVisibilityFilter(filter.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              visibilityFilter === filter.value
                ? "bg-brand-softbg dark:bg-brand-primary/10 text-brand-primary"
                : "text-text-para-light dark:text-text-para-dark hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {filter.label}
            <span className="ml-1.5 text-xs opacity-60">
              ({counts[filter.value]})
            </span>
          </button>
        ))}
      </motion.div>

      {/* Testimonials Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SKELETON_ITEMS.map((i) => (
            <div key={i} className="skeleton h-[340px] rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No testimonials found"
          description={
            visibilityFilter !== "all"
              ? "Try changing the filter"
              : "Add your first testimonial"
          }
          action={
            visibilityFilter === "all" ? (
              <Button
                variant="primary"
                onClick={() => navigate("/testimonials/create")}
              >
                Add Testimonial
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial._id}
              testimonial={testimonial}
              index={index}
              onView={handleViewDetail}
              onEdit={navigate}
              onDelete={setDeleteTarget}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <TestimonialDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        testimonial={selectedTestimonial}
        onEdit={handleEditFromModal}
        onDelete={handleDeleteFromModal}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Testimonial"
        message={`Delete testimonial from "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </motion.div>
  );
}

/**
 * TestimonialCard - Memoized individual testimonial card
 * Uses React.memo with shallow comparison to prevent unnecessary re-renders
 */
const TestimonialCard = memo(function TestimonialCard({
  testimonial,
  index,
  onView,
  onEdit,
  onDelete,
  onToggleVisibility,
}) {
  /**
   * Memoize callbacks per card instance
   */
  const handleView = useCallback(
    () => onView(testimonial),
    [onView, testimonial],
  );
  const handleEdit = useCallback(
    () => onEdit(`/testimonials/${testimonial._id}/edit`),
    [onEdit, testimonial._id],
  );
  const handleDelete = useCallback(
    () => onDelete(testimonial),
    [onDelete, testimonial],
  );
  const handleToggle = useCallback(
    (e) => onToggleVisibility(testimonial, e),
    [onToggleVisibility, testimonial],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.08)" }}
      className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden transition-shadow flex flex-col will-change-transform"
    >
      {/* Image/Thumbnail Area */}
      <div className="h-40 bg-gradient-to-br from-brand-softbg/50 to-brand-primary/5 dark:from-brand-primary/5 dark:to-brand-secondary/5 flex items-center justify-center relative">
        {testimonial.image?.url ? (
          <>
            <img
              src={testimonial.image.url}
              alt={testimonial.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {testimonial.video?.url && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon
                    icon={faPlay}
                    className="w-5 h-5 text-brand-primary ml-0.5"
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-md">
            <span className="text-2xl font-bold text-brand-primary">
              {testimonial.name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <StarRating value={testimonial.rating} readOnly size="sm" />
        <h3 className="font-semibold text-text-heading-light dark:text-text-heading-dark text-sm">
          {testimonial.name}
        </h3>
        {(testimonial.designation || testimonial.company) && (
          <p className="text-xs text-text-para-light dark:text-text-para-dark">
            {[testimonial.designation, testimonial.company]
              .filter(Boolean)
              .join(" at ")}
          </p>
        )}
        <p className="text-xs text-text-para-light dark:text-text-para-dark line-clamp-4 flex-1 italic">
          "{testimonial.content}"
        </p>

        {/* Visibility Toggle + Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border-light dark:border-border-dark">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleToggle}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
              testimonial.isVisible
                ? "bg-brand-primary"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
            aria-label={testimonial.isVisible ? "Hide" : "Show"}
          >
            <motion.div
              animate={{ x: testimonial.isVisible ? 20 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
            />
          </motion.button>

          <div className="flex items-center gap-0.5">
            <button
              onClick={handleView}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-text-para-light hover:text-brand-primary transition-all"
              title="View"
            >
              <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleEdit}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-text-para-light hover:text-blue-500 transition-all"
              title="Edit"
            >
              <FontAwesomeIcon icon={faEdit} className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-para-light hover:text-red-500 transition-all"
              title="Delete"
            >
              <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default TestimonialsPage;
