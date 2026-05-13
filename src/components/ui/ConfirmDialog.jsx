import Modal from "./Modal";
import Button from "./Button";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/**
 * Confirmation dialog for destructive or important actions
 * Built on Modal component
 * @param {Object} props
 * @param {boolean} props.isOpen - Dialog visibility
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onConfirm - Confirm action handler
 * @param {Function} [props.onCancel] - Cancel handler (uses onClose if not provided)
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message
 * @param {'danger'|'warning'} [props.variant='danger'] - Color variant
 * @param {string} [props.confirmText='Confirm'] - Confirm button text
 * @param {string} [props.cancelText='Cancel'] - Cancel button text
 * @param {boolean} [props.loading=false] - Confirm button loading state
 */
function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title,
  message,
  variant = "danger",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose(); // Close dialog after confirm
  };

  const iconColor = variant === "danger" ? "text-red-500" : "text-yellow-500";

  // ✅ FIXED: Determine confirm button variant correctly
  const confirmVariant = variant === "danger" ? "danger" : "primary";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <div
          className={`mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center ${iconColor} bg-opacity-10 bg-current`}
        >
          <FontAwesomeIcon icon={faTriangleExclamation} className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-text-heading-light dark:text-text-heading-dark mb-2">
          {title}
        </h3>
        <p className="text-sm text-text-para-light dark:text-text-para-dark mb-6">
          {message}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onCancel || onClose}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
