/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp, faXmark } from "@fortawesome/free-solid-svg-icons";

/**
 * Image uploader component with drag-drop support
 * @param {Object} props
 * @param {string} [props.currentImage] - Existing image URL to preview
 * @param {Function} props.onUpload - Called with File object when image selected
 * @param {Function} [props.onRemove] - Called when current image is removed
 * @param {string} [props.label='Upload Image'] - Label text
 * @param {string} [props.helperText] - Helper text below upload zone
 * @param {string[]} [props.accept=['image/jpeg','image/png','image/webp']] - Accepted file types
 * @param {number} [props.maxSizeMB=5] - Maximum file size in MB
 * @param {boolean} [props.disabled=false] - Disable upload
 * @param {string} [props.className] - Additional classes
 */
function ImageUploader({
  currentImage,
  onUpload,
  onRemove,
  label = "Upload Image",
  helperText,
  accept = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  maxSizeMB = 5,
  disabled = false,
  className = "",
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  /**
   * Validate selected file
   * @param {File} file - Selected file
   * @returns {boolean} Whether file is valid
   */
  const validateFile = (file) => {
    setError("");

    if (!accept.includes(file.type)) {
      setError(
        `Invalid file type. Accepted: ${accept.map((a) => a.split("/")[1]).join(", ")}`,
      );
      return false;
    }

    if (file.size > maxSizeBytes) {
      setError(`File too large. Maximum size is ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  /**
   * Handle file selection
   * @param {File} file - Selected file
   */
  const handleFile = useCallback(
    (file) => {
      if (!validateFile(file)) return;

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onUpload(file);
    },
    [onUpload, maxSizeBytes],
  );

  /**
   * Handle drag events
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  /**
   * Remove image
   */
  const handleRemove = () => {
    if (preview && preview !== currentImage) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setError("");
    onRemove?.();
  };

  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-heading-light dark:text-text-heading-dark mb-2">
          {label}
        </label>
      )}

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-lg overflow-hidden border border-border-light dark:border-border-dark"
          >
            <img
              src={preview}
              alt="Upload preview"
              className="w-full h-48 object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !disabled && inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative flex flex-col items-center justify-center
              h-48 rounded-lg border-2 border-dashed
              transition-all duration-200
              ${
                isDragOver
                  ? "border-brand-primary bg-brand-softbg/50 scale-[1.02]"
                  : "border-border-light dark:border-border-dark hover:border-brand-primary/50"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `.trim()}
          >
            <FontAwesomeIcon
              icon={faCloudArrowUp}
              className={`w-10 h-10 mb-3 ${isDragOver ? "text-brand-primary" : "text-text-para-light dark:text-text-para-dark"}`}
            />
            <p className="text-sm text-center text-text-para-light dark:text-text-para-dark">
              <span className="font-medium text-brand-primary">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-text-para-light dark:text-text-para-dark mt-1">
              PNG, JPG, WebP up to {maxSizeMB}MB
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={accept.join(",")}
              onChange={handleChange}
              className="hidden"
              disabled={disabled}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-xs text-red-500"
        >
          {error}
        </motion.p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-xs text-text-para-light dark:text-text-para-dark">
          {helperText}
        </p>
      )}
    </div>
  );
}

export default ImageUploader;
