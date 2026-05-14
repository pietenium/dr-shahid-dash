/* eslint-disable no-unused-vars */
import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faEnvelope,
  faCalendar,
  faClock,
  faMapMarkerAlt,
  faGlobe,
  faIdBadge,
  faComment,
  faCheck,
  faBan,
  faUndo,
  faDesktop,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@components/ui/Modal";
import Button from "@components/ui/Button";
import StatusBadge from "@components/shared/StatusBadge";
import { formatDate, formatDateTime } from "@utils/formatDate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAppointmentStatus } from "@api/appointment.api";
import { toast } from "sonner";

/**
 * AppointmentDetailModal - Full detail view of an appointment
 * Shows contact info, appointment details, location, system info
 * Provides status change actions (Confirm, Cancel, Restore)
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {Object|null} props.appointment - Appointment data object
 * @param {boolean} [props.loading=false] - Data loading state
 */
const AppointmentDetailModal = memo(function AppointmentDetailModal({
  isOpen,
  onClose,
  appointment,
  loading = false,
}) {
  const queryClient = useQueryClient();

  /**
   * Status update mutation
   * Invalidates appointments cache on success
   */
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateAppointmentStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", "charts"] });
      toast.success(
        `Appointment ${data.data?.status?.toLowerCase()} successfully`,
      );
      onClose();
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || "Failed to update status";
      toast.error(message);
    },
  });

  if (!appointment && !loading) return null;

  const isPending = appointment?.status === "PENDING";
  const isConfirmed = appointment?.status === "CONFIRMED";
  const isCancelled = appointment?.status === "CANCELLED";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      {loading ? (
        /* Skeleton Loader */
        <div className="space-y-6">
          <div className="skeleton h-6 w-48 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-5 w-36 rounded" />
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-end">
            <div className="skeleton h-10 w-28 rounded-lg" />
            <div className="skeleton h-10 w-28 rounded-lg" />
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-light dark:border-border-dark">
            <div className="flex items-center gap-3 min-w-0">
              {/* Patient Initials Avatar */}
              <div className="w-10 h-10 rounded-full bg-brand-softbg dark:bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-brand-primary">
                  {appointment?.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-text-heading-light dark:text-text-heading-dark truncate">
                  {appointment?.name}
                </h3>
              </div>
            </div>
            <StatusBadge
              status={appointment?.status}
              className="flex-shrink-0 ml-3"
            />
          </div>

          {/* Detail Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-para-light dark:text-text-para-dark">
                Contact Information
              </h4>

              <DetailItem
                icon={faPhone}
                label="Phone"
                value={appointment?.phone || "N/A"}
              />
              <DetailItem
                icon={faEnvelope}
                label="Email"
                value={appointment?.email || "N/A"}
              />

              {appointment?.message && (
                <DetailItem
                  icon={faComment}
                  label="Message"
                  value={appointment.message}
                  fullWidth
                />
              )}
            </div>

            {/* Appointment Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-para-light dark:text-text-para-dark">
                Appointment Details
              </h4>

              <DetailItem
                icon={faCalendar}
                label="Preferred Date"
                value={formatDate(
                  appointment?.preferredDate,
                  "EEEE, MMMM dd, yyyy",
                )}
              />
              <DetailItem
                icon={faClock}
                label="Preferred Time"
                value={appointment?.preferredTime || "N/A"}
              />
            </div>

            {/* Location Information */}
            {appointment?.location && (
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-para-light dark:text-text-para-dark">
                  Location
                </h4>

                <DetailItem
                  icon={faMapMarkerAlt}
                  label="City"
                  value={appointment.location.city || "N/A"}
                />
                <DetailItem
                  icon={faMapMarkerAlt}
                  label="Region"
                  value={appointment.location.region || "N/A"}
                />
                <DetailItem
                  icon={faGlobe}
                  label="Country"
                  value={appointment.location.country || "N/A"}
                />
                <DetailItem
                  icon={faDesktop}
                  label="IP Address"
                  value={appointment?.ipAddress || "N/A"}
                  mono
                />
              </div>
            )}

            {/* System Information */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-para-light dark:text-text-para-dark">
                System
              </h4>

              <DetailItem
                icon={faCalendar}
                label="Submitted At"
                value={formatDateTime(appointment?.createdAt)}
              />
              <DetailItem
                icon={faIdBadge}
                label="Appointment ID"
                value={appointment?._id || "N/A"}
                mono
                small
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-border-light dark:border-border-dark">
            {isPending && (
              <>
                <Button
                  variant="danger"
                  size="md"
                  onClick={() =>
                    statusMutation.mutate({
                      id: appointment._id,
                      status: "CANCELLED",
                    })
                  }
                  loading={statusMutation.isPending}
                  disabled={statusMutation.isPending}
                  leftIcon={faBan}
                >
                  Cancel Appointment
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() =>
                    statusMutation.mutate({
                      id: appointment._id,
                      status: "CONFIRMED",
                    })
                  }
                  loading={statusMutation.isPending}
                  disabled={statusMutation.isPending}
                  leftIcon={faCheck}
                >
                  Confirm Appointment
                </Button>
              </>
            )}

            {isConfirmed && (
              <Button
                variant="outline"
                size="md"
                onClick={() =>
                  statusMutation.mutate({
                    id: appointment._id,
                    status: "CANCELLED",
                  })
                }
                loading={statusMutation.isPending}
                disabled={statusMutation.isPending}
                leftIcon={faBan}
                className="!text-red-500 !border-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/20"
              >
                Cancel Appointment
              </Button>
            )}

            {isCancelled && (
              <Button
                variant="ghost"
                size="md"
                onClick={() =>
                  statusMutation.mutate({
                    id: appointment._id,
                    status: "CONFIRMED",
                  })
                }
                loading={statusMutation.isPending}
                disabled={statusMutation.isPending}
                leftIcon={faUndo}
              >
                Restore to Confirmed
              </Button>
            )}

            <Button variant="ghost" size="md" onClick={onClose}>
              Close
            </Button>
          </div>
        </motion.div>
      )}
    </Modal>
  );
});

/**
 * DetailItem - Single detail row with icon, label, and value
 * @param {Object} props
 * @param {import('@fortawesome/react-fontawesome').IconProp} props.icon - FontAwesome icon
 * @param {string} props.label - Detail label
 * @param {string} props.value - Detail value
 * @param {boolean} [props.mono=false] - Use monospace font
 * @param {boolean} [props.small=false] - Use smaller font
 * @param {boolean} [props.fullWidth=false] - Full width on both columns
 */
const DetailItem = memo(function DetailItem({
  icon,
  label,
  value,
  mono = false,
  small = false,
  fullWidth = false,
}) {
  const valueClasses = `
    text-sm text-text-heading-light dark:text-text-heading-dark
    ${mono ? "font-mono" : "font-medium"}
    ${small ? "text-xs" : "text-sm"}
  `.trim();

  return (
    <div
      className={`flex items-start gap-3 ${fullWidth ? "md:col-span-2" : ""}`}
    >
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
        <FontAwesomeIcon
          icon={icon}
          className="w-3.5 h-3.5 text-text-para-light dark:text-text-para-dark"
        />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-text-para-light dark:text-text-para-dark mb-0.5">
          {label}
        </p>
        <p className={valueClasses}>{value || "—"}</p>
      </div>
    </div>
  );
});

export default AppointmentDetailModal;
