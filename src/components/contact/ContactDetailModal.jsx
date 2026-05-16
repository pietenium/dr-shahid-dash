/* eslint-disable no-unused-vars */
import { memo } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faCalendar,
  faUser,
  faEnvelopeOpen,
  faReply,
  faArchive,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@components/ui/Modal";
import Button from "@components/ui/Button";
import StatusBadge from "@components/shared/StatusBadge";
import { formatDate, formatRelativeTime } from "@utils/formatDate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateContactStatus, deleteContactMessage } from "@api/contact.api";
import { toast } from "sonner";

/**
 * ContactDetailModal - Full detail view of a contact message
 * Shows sender info, message content, and status management actions
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {Object|null} props.message - Contact message data
 * @param {boolean} [props.loading=false] - Loading state
 */
const ContactDetailModal = memo(function ContactDetailModal({
  isOpen,
  onClose,
  message,
  loading = false,
}) {
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: ({ id }) => updateContactStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact"] });
      toast.success("Status updated");
      onClose();
    },
    onError: () => toast.error("Failed to update status"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContactMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact"] });
      toast.success("Message deleted");
      onClose();
    },
    onError: () => toast.error("Failed to delete message"),
  });

  if (!message && !loading) return null;

  const isUnread = !message?.isRead;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      {loading ? (
        <div className="space-y-4">
          <div className="skeleton h-6 w-48 rounded" />
          <div className="skeleton h-32 rounded-xl" />
          <div className="flex gap-2">
            <div className="skeleton h-10 w-28 rounded-lg" />
            <div className="skeleton h-10 w-28 rounded-lg" />
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-light dark:border-border-dark">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-brand-softbg dark:bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon
                  icon={faUser}
                  className="w-4 h-4 text-brand-primary"
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-text-heading-light dark:text-text-heading-dark truncate">
                  {message?.name}
                </h3>
                <p className="text-sm text-text-para-light dark:text-text-para-dark truncate">
                  {message?.subject || "No subject"}
                </p>
              </div>
            </div>
            <StatusBadge
              status={isUnread ? "UNREAD" : "READ"}
              className="flex-shrink-0 ml-3"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="w-3.5 h-3.5 text-text-para-light"
                />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-para-light">
                  Email
                </p>
                <a
                  href={`mailto:${message?.email}`}
                  className="text-sm font-medium text-brand-primary hover:underline"
                >
                  {message?.email || "N/A"}
                </a>
              </div>
            </div>
            {message?.phone && (
              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="w-3.5 h-3.5 text-text-para-light"
                  />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-para-light">
                    Phone
                  </p>
                  <a
                    href={`tel:${message.phone}`}
                    className="text-sm font-medium text-brand-primary hover:underline"
                  >
                    {message.phone}
                  </a>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon
                  icon={faCalendar}
                  className="w-3.5 h-3.5 text-text-para-light"
                />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-para-light">
                  Received
                </p>
                <p className="text-sm text-text-heading-light dark:text-text-heading-dark">
                  {formatRelativeTime(message?.createdAt)}
                </p>
                <p className="text-[10px] text-text-para-light">
                  {formatDate(message?.createdAt, "MMM dd, yyyy hh:mm a")}
                </p>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="mb-6 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <p className="text-sm text-text-heading-light dark:text-text-heading-dark leading-relaxed whitespace-pre-wrap">
              {message?.message || "No message content"}
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap gap-2 justify-end pt-4 border-t border-border-light dark:border-border-dark">
            {isUnread ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => statusMutation.mutate({ id: message._id })}
                loading={statusMutation.isPending}
                leftIcon={faEnvelope}
              >
                Mark as Read
              </Button>
            ) : (
              <Button variant="primary" size="sm" leftIcon={faEnvelopeOpen}>
                Read
              </Button>
            )}

            <div className="w-px h-8 bg-border-light dark:bg-border-dark mx-1 self-center" />
            <Button
              variant="danger"
              size="sm"
              onClick={() => deleteMutation.mutate(message._id)}
              loading={deleteMutation.isPending}
              leftIcon={faTrash}
            >
              Delete
            </Button>
          </div>
        </motion.div>
      )}
    </Modal>
  );
});

export default ContactDetailModal;
