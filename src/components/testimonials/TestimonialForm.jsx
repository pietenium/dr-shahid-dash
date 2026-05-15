/* eslint-disable no-unused-vars */
import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faVideo,
  faTimes,
  faFileVideo,
} from "@fortawesome/free-solid-svg-icons";
import Input from "@components/ui/Input";
import Button from "@components/ui/Button";
import StarRating from "@components/testimonials/StarRating";
import { toast } from "sonner";

/**
 * TestimonialForm - Shared form for Create and Edit pages
 * Features: Image upload, video upload, star rating, visibility toggle
 *
 * @param {Object} props
 * @param {Object} [props.defaultValues] - Initial values for edit mode
 * @param {Function} props.onSubmit - Submit handler receives FormData
 * @param {boolean} props.isSubmitting - Loading state
 * @param {'create'|'edit'} [props.mode='create'] - Form mode
 */
function TestimonialForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  mode = "create",
}) {
  const [name, setName] = useState(defaultValues?.name || "");
  const [designation, setDesignation] = useState(
    defaultValues?.designation || "",
  );
  const [company, setCompany] = useState(defaultValues?.company || "");
  const [content, setContent] = useState(defaultValues?.content || "");
  const [rating, setRating] = useState(defaultValues?.rating || 0);
  const [isVisible, setIsVisible] = useState(
    defaultValues?.isVisible !== undefined ? defaultValues.isVisible : true,
  );
  const [errors, setErrors] = useState({});

  // Image state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    defaultValues?.image?.url || "",
  );
  const imageInputRef = useRef(null);

  // Video state
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(
    defaultValues?.video?.url || "",
  );
  const [videoFileName, setVideoFileName] = useState("");
  const [videoFileSize, setVideoFileSize] = useState("");
  const videoInputRef = useRef(null);

  /**
   * Format bytes to human-readable size
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted size
   */
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  /**
   * Handle image file selection
   */
  const handleImageChange = useCallback((e) => {
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
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  /**
   * Handle video file selection
   */
  const handleVideoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["video/mp4", "video/webm", "video/quicktime"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select MP4, WebM, or MOV file");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video must be under 100MB");
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setVideoFileName(file.name);
    setVideoFileSize(formatFileSize(file.size));
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!content.trim()) newErrors.content = "Testimonial content is required";
    if (rating === 0) newErrors.rating = "Please select a rating";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all required fields");
      return;
    }

    setErrors({});
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("content", content.trim());
    formData.append("rating", rating.toString());
    formData.append("isVisible", isVisible.toString());
    if (designation.trim()) formData.append("designation", designation.trim());
    if (company.trim()) formData.append("company", company.trim());
    if (imageFile) formData.append("image", imageFile);
    if (videoFile) formData.append("video", videoFile);

    onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ========== MEDIA SECTION ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5 space-y-5"
      >
        <h3 className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark">
          📸 Media
        </h3>

        {/* Image Uploader */}
        <div>
          <label className="block text-sm font-medium text-text-heading-light dark:text-text-heading-dark mb-2">
            Photo (optional)
          </label>
          <div
            onClick={() => imageInputRef.current?.click()}
            className="border-2 border-dashed border-border-light dark:border-border-dark rounded-xl p-6 text-center cursor-pointer hover:border-brand-primary hover:bg-brand-softbg/20 dark:hover:bg-brand-primary/5 transition-all duration-200"
          >
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-40 rounded-xl"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageFile(null);
                    setImagePreview("");
                  }}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-brand-softbg dark:bg-brand-primary/10 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faImage}
                    className="w-5 h-5 text-brand-primary"
                  />
                </div>
                <p className="text-sm text-text-para-light">
                  Click to upload photo
                </p>
                <p className="text-xs text-text-para-light">
                  JPG, PNG, WebP, GIF (max 5MB)
                </p>
              </div>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Video Uploader */}
        <div>
          <label className="block text-sm font-medium text-text-heading-light dark:text-text-heading-dark mb-2">
            🎬 Video Testimonial (optional)
          </label>
          <div
            onClick={() => videoInputRef.current?.click()}
            className="border-2 border-dashed border-border-light dark:border-border-dark rounded-xl p-8 text-center cursor-pointer hover:border-brand-primary hover:bg-brand-softbg/20 dark:hover:bg-brand-primary/5 transition-all duration-200"
          >
            {videoPreview ? (
              <div className="space-y-3">
                {/* Video Preview */}
                <div className="relative rounded-xl overflow-hidden bg-black max-h-52 mx-auto">
                  <video
                    src={videoPreview}
                    className="w-full max-h-52"
                    controls
                    preload="metadata"
                  />
                </div>
                {/* File Info */}
                <div className="flex items-center justify-center gap-3 text-sm">
                  <FontAwesomeIcon
                    icon={faFileVideo}
                    className="w-5 h-5 text-brand-primary"
                  />
                  <span className="font-medium text-text-heading-light dark:text-text-heading-dark">
                    {videoFileName}
                  </span>
                  <span className="text-text-para-light">
                    ({videoFileSize})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVideoFile(null);
                    setVideoPreview("");
                    setVideoFileName("");
                    setVideoFileSize("");
                  }}
                  className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 mx-auto"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-2.5 h-2.5" />{" "}
                  Remove video
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faVideo}
                    className="w-7 h-7 text-purple-500"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-heading-light dark:text-text-heading-dark">
                    Click to upload video
                  </p>
                  <p className="text-xs text-text-para-light mt-1">
                    MP4, WebM, MOV (max 100MB)
                  </p>
                </div>
              </div>
            )}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideoChange}
              className="hidden"
            />
          </div>
          <p className="text-[10px] text-text-para-light mt-2 text-center">
            Video uploaded to Cloudinary. May take a moment to process.
          </p>
        </div>
      </motion.div>

      {/* ========== INFO SECTION ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5 space-y-4"
      >
        <h3 className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark">
          👤 Information
        </h3>

        <Input
          label="Name"
          placeholder="Patient name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => ({ ...prev, name: "" }));
          }}
          error={errors.name}
          disabled={isSubmitting}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Designation (optional)"
            placeholder="e.g. CEO, Teacher"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            disabled={isSubmitting}
          />
          <Input
            label="Company (optional)"
            placeholder="e.g. Google, Hospital"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-heading-light dark:text-text-heading-dark mb-1">
            Testimonial Content
          </label>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setErrors((prev) => ({ ...prev, content: "" }));
            }}
            placeholder="What did the patient say about Dr. Sahidur Rahman Khan?"
            maxLength={1000}
            rows={5}
            disabled={isSubmitting}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm resize-none transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50 bg-white dark:bg-[#0f172a] text-text-heading-light dark:text-text-heading-dark placeholder:text-text-para-light ${
              errors.content
                ? "border-red-500"
                : "border-border-light dark:border-border-dark"
            }`}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.content && (
              <p className="text-xs text-red-500">{errors.content}</p>
            )}
            <p className="text-[10px] text-text-para-light ml-auto">
              {content.length}/1000
            </p>
          </div>
        </div>
      </motion.div>

      {/* ========== RATING SECTION ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5 space-y-4"
      >
        <h3 className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark">
          ⭐ Rating
        </h3>
        <div className="flex flex-col items-center gap-3 py-3">
          <StarRating
            value={rating}
            onChange={setRating}
            disabled={isSubmitting}
            size="lg"
          />
          {errors.rating && (
            <p className="text-xs text-red-500">{errors.rating}</p>
          )}
          {rating > 0 && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-brand-primary"
            >
              {rating === 5
                ? "Excellent!"
                : rating === 4
                  ? "Very Good!"
                  : rating === 3
                    ? "Good"
                    : rating === 2
                      ? "Fair"
                      : "Poor"}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* ========== VISIBILITY & SUBMIT ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5 space-y-4 sticky bottom-4"
      >
        {/* Visibility Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark">
              Show on Website
            </h3>
            <p className="text-xs text-text-para-light mt-0.5">
              {isVisible ? "Visible to public" : "Hidden from public"}
            </p>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsVisible(!isVisible)}
            disabled={isSubmitting}
            className={`
              relative w-12 h-7 rounded-full transition-colors duration-300
              ${isVisible ? "bg-brand-primary" : "bg-gray-300 dark:bg-gray-600"}
              disabled:opacity-50
            `}
            aria-label={isVisible ? "Hide testimonial" : "Show testimonial"}
            role="switch"
            aria-checked={isVisible}
          >
            <motion.div
              animate={{ x: isVisible ? 22 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
            />
          </motion.button>
        </div>

        {/* Submit Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          className="w-full"
        >
          {mode === "create" ? "Add Testimonial" : "Update Testimonial"}
        </Button>
      </motion.div>
    </div>
  );
}

export default TestimonialForm;
