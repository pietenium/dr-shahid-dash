/* eslint-disable no-unused-vars */
import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faLink,
  faUpload,
  faImage,
  faTimes,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import Input from "@components/ui/Input";
import Button from "@components/ui/Button";
import { toast } from "sonner";

/**
 * DOI validation regex
 * Matches patterns like 10.1234/example or full doi.org URLs
 * @constant {RegExp}
 */
const DOI_REGEX = /^(https?:\/\/doi\.org\/)?10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;

/**
 * ResearchForm - Shared form component for Create and Edit pages
 * Features:
 * - Upload type selector (PDF / DOI) with animated radio cards
 * - Conditional fields based on upload type
 * - PDF file upload with drag-drop (max 20MB)
 * - DOI URL input with live validation
 * - Thumbnail image upload (optional, 5MB)
 * - Publishing status and date controls
 *
 * @param {Object} props
 * @param {Object} [props.defaultValues] - Initial values for edit mode
 * @param {Function} props.onSubmit - Submit handler receives FormData
 * @param {boolean} props.isSubmitting - Loading state
 * @param {'create'|'edit'} [props.mode='create'] - Form mode
 */
function ResearchForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  mode = "create",
}) {
  const [title, setTitle] = useState(defaultValues?.title || "");
  const [description, setDescription] = useState(
    defaultValues?.description || "",
  );
  const [uploadType, setUploadType] = useState(
    defaultValues?.uploadType || "PDF",
  );
  const [doiUrl, setDoiUrl] = useState(defaultValues?.doiUrl || "");
  const [doiError, setDoiError] = useState("");
  const [status, setStatus] = useState(defaultValues?.status || "DRAFT");
  const [publishedAt, setPublishedAt] = useState(
    defaultValues?.publishedAt?.split("T")[0] || "",
  );

  // File states
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState(
    defaultValues?.pdfFile?.url ? "Current PDF (click to replace)" : "",
  );
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(
    defaultValues?.thumbnailImage?.url || "",
  );

  // Existing files for edit mode
  const existingPdfUrl = defaultValues?.pdfFile?.url || "";

  const [errors, setErrors] = useState({});
  const pdfInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  /**
   * Format file size to human-readable string
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  /**
   * Handle PDF file selection
   */
  const handlePdfChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("PDF must be under 20MB");
      return;
    }

    setPdfFile(file);
    setPdfFileName(`${file.name} (${formatFileSize(file.size)})`);
  }, []);

  /**
   * Handle thumbnail image selection
   */
  const handleThumbnailChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }, []);

  /**
   * Validate DOI URL
   */
  const validateDoi = (value) => {
    if (!value) {
      setDoiError("");
      return;
    }
    if (!DOI_REGEX.test(value)) {
      setDoiError("Invalid DOI format. Example: 10.1234/example");
    } else {
      setDoiError("");
    }
  };

  /**
   * Normalize DOI URL for display
   */
  const getNormalizedDoi = (value) => {
    if (!value) return "";
    if (value.startsWith("https://doi.org/")) return value;
    return `https://doi.org/${value}`;
  };

  /**
   * Handle form submission
   * @param {string} publishStatus - DRAFT or PUBLISHED
   */
  const handleSubmit = (publishStatus) => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = "Title is required";

    if (uploadType === "PDF" && !pdfFile && !existingPdfUrl) {
      newErrors.pdf = "PDF file is required";
    }

    if (uploadType === "DOI") {
      if (!doiUrl.trim()) {
        newErrors.doi = "DOI URL is required";
      } else if (!DOI_REGEX.test(doiUrl)) {
        newErrors.doi = "Invalid DOI format";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors below");
      return;
    }

    setErrors({});

    const formData = new FormData();
    formData.append("title", title.trim());
    if (description.trim()) formData.append("description", description.trim());
    formData.append("uploadType", uploadType);
    formData.append("status", publishStatus || status);
    if (publishedAt)
      formData.append("publishedAt", new Date(publishedAt).toISOString());

    if (uploadType === "DOI") {
      formData.append("doiUrl", getNormalizedDoi(doiUrl));
    }

    if (pdfFile) formData.append("pdfFile", pdfFile);
    if (thumbnailFile) formData.append("thumbnailImage", thumbnailFile);

    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ========== UPLOAD TYPE SELECTOR ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5"
      >
        <h3 className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark mb-4">
          Upload Type
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              value: "PDF",
              icon: faFilePdf,
              label: "PDF Upload",
              desc: "Upload a PDF document",
              color: "red",
            },
            {
              value: "DOI",
              icon: faLink,
              label: "DOI Link",
              desc: "Link to external paper",
              color: "blue",
            },
          ].map((type) => (
            <motion.button
              key={type.value}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUploadType(type.value)}
              className={`
                flex flex-col items-center gap-2 p-5 rounded-xl border-2 text-center transition-all duration-200
                ${
                  uploadType === type.value
                    ? `border-brand-primary bg-brand-softbg dark:bg-brand-primary/10 shadow-md`
                    : "border-border-light dark:border-border-dark hover:border-brand-primary/50 hover:shadow-sm"
                }
              `}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  type.color === "red"
                    ? "bg-red-100 dark:bg-red-900/20 text-red-500"
                    : "bg-blue-100 dark:bg-blue-900/20 text-blue-500"
                }`}
              >
                <FontAwesomeIcon icon={type.icon} className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-text-heading-light dark:text-text-heading-dark text-sm">
                  {type.label}
                </p>
                <p className="text-xs text-text-para-light dark:text-text-para-dark">
                  {type.desc}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ========== CONDITIONAL FIELDS ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5 space-y-4"
      >
        {uploadType === "PDF" ? (
          /* PDF Upload Section */
          <div>
            <label className="block text-sm font-medium text-text-heading-light dark:text-text-heading-dark mb-2">
              PDF Document{" "}
              {mode === "create" && <span className="text-red-500">*</span>}
            </label>

            <div
              onClick={() => pdfInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                ${
                  pdfFile || existingPdfUrl
                    ? "border-green-400 bg-green-50/30 dark:bg-green-900/10"
                    : errors.pdf
                      ? "border-red-400 bg-red-50/30 dark:bg-red-900/10"
                      : "border-border-light dark:border-border-dark hover:border-brand-primary hover:bg-brand-softbg/20 dark:hover:bg-brand-primary/5"
                }
              `}
            >
              {pdfFile || existingPdfUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <FontAwesomeIcon
                    icon={faFilePdf}
                    className="w-10 h-10 text-red-500"
                  />
                  <p className="text-sm font-medium text-text-heading-light dark:text-text-heading-dark">
                    {pdfFileName || "PDF file selected"}
                  </p>
                  <p className="text-xs text-text-para-light">
                    Click to replace
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <FontAwesomeIcon
                    icon={faUpload}
                    className="w-8 h-8 text-text-para-light"
                  />
                  <p className="text-sm font-medium text-text-heading-light dark:text-text-heading-dark">
                    Click to upload PDF
                  </p>
                  <p className="text-xs text-text-para-light">
                    Max 20MB • .pdf only
                  </p>
                </div>
              )}
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf"
                onChange={handlePdfChange}
                className="hidden"
              />
            </div>

            {(pdfFile || pdfFileName) && !existingPdfUrl && (
              <button
                type="button"
                onClick={() => {
                  setPdfFile(null);
                  setPdfFileName("");
                }}
                className="mt-2 text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faTimes} className="w-2.5 h-2.5" />{" "}
                Remove
              </button>
            )}

            {errors.pdf && (
              <p className="text-xs text-red-500 mt-1">{errors.pdf}</p>
            )}
          </div>
        ) : (
          /* DOI Input Section */
          <div>
            <Input
              label="DOI URL"
              placeholder="10.1234/example or https://doi.org/10.1234/example"
              value={doiUrl}
              onChange={(e) => {
                setDoiUrl(e.target.value);
                validateDoi(e.target.value);
              }}
              error={errors.doi || doiError}
              disabled={isSubmitting}
              leftIcon={faLink}
            />
            {doiUrl && !doiError && (
              <div className="mt-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                <span>Resolves to: {getNormalizedDoi(doiUrl)}</span>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* ========== COMMON FIELDS ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5 space-y-4"
      >
        <h3 className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark">
          📝 Details
        </h3>

        <Input
          label="Title"
          placeholder="Research paper title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors((prev) => ({ ...prev, title: "" }));
          }}
          error={errors.title}
          disabled={isSubmitting}
        />

        <div>
          <label className="block text-sm font-medium text-text-heading-light dark:text-text-heading-dark mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the research paper (optional)"
            maxLength={2000}
            rows={4}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] px-3 py-2.5 text-sm text-text-heading-light dark:text-text-heading-dark placeholder:text-text-para-light focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all resize-none disabled:opacity-50"
          />
          <p className="text-[10px] text-text-para-light mt-0.5 text-right">
            {description.length}/2000
          </p>
        </div>
      </motion.div>

      {/* ========== THUMBNAIL IMAGE ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5 space-y-4"
      >
        <h3 className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark">
          🖼️ Thumbnail Image
        </h3>

        <div
          onClick={() => thumbnailInputRef.current?.click()}
          className="border-2 border-dashed border-border-light dark:border-border-dark rounded-xl p-6 text-center cursor-pointer hover:border-brand-primary transition-all duration-200"
        >
          {thumbnailPreview ? (
            <div className="relative">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="max-h-40 rounded-lg mx-auto"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setThumbnailFile(null);
                  setThumbnailPreview("");
                }}
                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
              >
                <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <FontAwesomeIcon
                icon={faImage}
                className="w-8 h-8 text-text-para-light"
              />
              <p className="text-sm text-text-para-light">
                Click to upload (optional, max 5MB)
              </p>
            </div>
          )}
          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="hidden"
          />
        </div>
      </motion.div>

      {/* ========== PUBLISHING ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5 space-y-4 sticky bottom-4"
      >
        <h3 className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark">
          📅 Publishing
        </h3>

        <div>
          <label className="block text-sm font-medium text-text-heading-light dark:text-text-heading-dark mb-2">
            Status
          </label>
          <div className="flex gap-2">
            {["DRAFT", "PUBLISHED"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                disabled={isSubmitting}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  status === s
                    ? "bg-brand-softbg dark:bg-brand-primary/10 text-brand-primary border-2 border-brand-primary"
                    : "bg-gray-50 dark:bg-gray-800 text-text-para-light border-2 border-transparent"
                }`}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Published Date"
          type="date"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
          disabled={isSubmitting}
          helperText="Leave empty for current date"
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleSubmit("DRAFT")}
            loading={isSubmitting}
            disabled={isSubmitting}
            className="flex-1"
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => handleSubmit("PUBLISHED")}
            loading={isSubmitting}
            disabled={isSubmitting}
            className="flex-1"
          >
            Publish
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default ResearchForm;
