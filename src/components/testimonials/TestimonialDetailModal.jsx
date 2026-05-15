/* eslint-disable no-unused-vars */
import { memo } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faBuilding,
  faBriefcase,
  faEdit,
  faTrash,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@components/ui/Modal";
import Button from "@components/ui/Button";
import StarRating from "@components/testimonials/StarRating";
import { formatDate } from "@utils/formatDate";

/**
 * TestimonialDetailModal - Full detail view of a testimonial
 * Shows image, video player, full content, rating, and metadata
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {Object|null} props.testimonial - Testimonial data
 * @param {Function} [props.onEdit] - Edit handler
 * @param {Function} [props.onDelete] - Delete handler
 * @param {boolean} [props.loading=false] - Loading state
 */
const TestimonialDetailModal = memo(function TestimonialDetailModal({
  isOpen,
  onClose,
  testimonial,
  onEdit,
  onDelete,
  loading = false,
}) {
  if (!testimonial && !loading) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-6 w-48 rounded" />
          <div className="skeleton h-64 rounded-xl" />
          <div className="skeleton h-20 rounded" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-light dark:border-border-dark">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              {testimonial?.image?.url ? (
                <img
                  src={testimonial.image.url}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-brand-primary"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-brand-softbg dark:bg-brand-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-brand-primary">
                    {testimonial?.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-text-heading-light dark:text-text-heading-dark">
                  {testimonial?.name}
                </h3>
                <StarRating
                  value={testimonial?.rating || 0}
                  readOnly
                  size="sm"
                />
              </div>
            </div>

            {/* Visibility badge */}
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                testimonial?.isVisible
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              <FontAwesomeIcon
                icon={testimonial?.isVisible ? faEye : faEyeSlash}
                className="w-3 h-3"
              />
              {testimonial?.isVisible ? "Visible" : "Hidden"}
            </span>
          </div>

          {/* Image Full Display */}
          {testimonial?.image?.url && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <img
                src={testimonial.image.url}
                alt={testimonial.name}
                className="w-full max-h-80 object-cover rounded-xl"
              />
            </div>
          )}

          {/* Video Player */}
          {testimonial?.video?.url && (
            <div className="mb-6 rounded-xl overflow-hidden bg-black shadow-lg">
              <video
                src={testimonial.video.url}
                controls
                className="w-full max-h-96"
                poster={testimonial.image?.url}
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Full Content */}
          <div className="mb-6 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <p className="text-sm text-text-heading-light dark:text-text-heading-dark leading-relaxed italic">
              "{testimonial?.content}"
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
            {testimonial?.designation && (
              <div className="flex items-center gap-2 text-text-para-light dark:text-text-para-dark">
                <FontAwesomeIcon icon={faBriefcase} className="w-3.5 h-3.5" />
                <span>{testimonial.designation}</span>
              </div>
            )}
            {testimonial?.company && (
              <div className="flex items-center gap-2 text-text-para-light dark:text-text-para-dark">
                <FontAwesomeIcon icon={faBuilding} className="w-3.5 h-3.5" />
                <span>{testimonial.company}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-text-para-light dark:text-text-para-dark">
              <FontAwesomeIcon icon={faCalendar} className="w-3.5 h-3.5" />
              <span>
                Added {formatDate(testimonial?.createdAt, "MMM dd, yyyy")}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border-light dark:border-border-dark">
            {onDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={onDelete}
                leftIcon={faTrash}
              >
                Delete
              </Button>
            )}
            {onEdit && (
              <Button
                variant="primary"
                size="sm"
                onClick={onEdit}
                leftIcon={faEdit}
              >
                Edit
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </Modal>
  );
});

export default TestimonialDetailModal;
