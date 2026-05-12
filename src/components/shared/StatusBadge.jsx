import Badge from "@components/ui/Badge";

const statusVariants = {
  // Appointment statuses
  PENDING: "warning",
  CONFIRMED: "success",
  CANCELLED: "danger",
  // Content statuses
  DRAFT: "default",
  PUBLISHED: "success",
  // Roles
  ADMIN: "purple",
  MODERATOR: "info",
  // Contact statuses
  UNREAD: "info",
  READ: "default",
  REPLIED: "success",
  ARCHIVED: "default",
  // Visibility
  VISIBLE: "success",
  HIDDEN: "default",
  // Active status
  ACTIVE: "success",
  INACTIVE: "danger",
};

/**
 * Status badge with color coding and dot indicator
 * @param {Object} props
 * @param {string} props.status - Status value
 * @param {string} [props.label] - Custom label (uses status if not provided)
 * @param {string} [props.className] - Additional classes
 */
function StatusBadge({ status, label, className = "" }) {
  const variant = statusVariants[status] || "default";
  const displayLabel = label || status;

  return (
    <Badge variant={variant} dot className={className}>
      {displayLabel}
    </Badge>
  );
}

export default StatusBadge;
