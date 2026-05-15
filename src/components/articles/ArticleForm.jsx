/* eslint-disable no-unused-vars */
import { useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faTimes } from "@fortawesome/free-solid-svg-icons";
import { getCategories } from "@api/article.api";
import TipTapEditor from "./TipTapEditor";
import Input from "@components/ui/Input";
import Button from "@components/ui/Button";
import { toast } from "sonner";

/**
 * ArticleForm - Shared form component for Create and Edit pages
 *
 * Layout: 2-column on lg+ (Editor 65% | Sidebar 35%)
 * On mobile: stacked vertically
 *
 * @param {Object} props
 * @param {Object} [props.defaultValues] - Initial form values for edit mode
 * @param {Function} props.onSubmit - Submit handler receives FormData
 * @param {boolean} props.isSubmitting - Loading state
 * @param {'create'|'edit'} [props.mode='create'] - Form mode
 */
function ArticleForm({ defaultValues, onSubmit, isSubmitting }) {
  const [title, setTitle] = useState(defaultValues?.title || "");
  const [content, setContent] = useState(defaultValues?.content || "");
  const [excerpt, setExcerpt] = useState(defaultValues?.excerpt || "");
  const [author, setAuthor] = useState(defaultValues?.author || "");
  const [category, setCategory] = useState(
    defaultValues?.category?._id || defaultValues?.category || "",
  );
  const [articleType, setArticleType] = useState(
    defaultValues?.articleType || "MEDICAL",
  );
  const [status, setStatus] = useState(defaultValues?.status || "DRAFT");
  const [tags, setTags] = useState(defaultValues?.tags?.join(", ") || "");
  const [publishedAt, setPublishedAt] = useState(
    defaultValues?.publishedAt?.split("T")[0] || "",
  );
  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredPreview, setFeaturedPreview] = useState(
    defaultValues?.featuredImage?.url || "",
  );
  const [ogImage, setOgImage] = useState(null);
  const [ogPreview, setOgPreview] = useState(defaultValues?.ogImage?.url || "");
  const [errors, setErrors] = useState({});
  const featuredInputRef = useRef(null);
  const ogInputRef = useRef(null);

  /**
   * Fetch categories for dropdown
   */
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
  });

  const categories = categoriesData?.data || [];

  /**
   * Handle featured image selection
   */
  const handleFeaturedImage = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setFeaturedImage(file);
    setFeaturedPreview(URL.createObjectURL(file));
  }, []);

  /**
   * Handle OG image selection
   */
  const handleOgImage = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setOgImage(file);
    setOgPreview(URL.createObjectURL(file));
  }, []);

  /**
   * Validate form and submit
   */
  const handleSubmit = (publishStatus) => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!content || content === "<p></p>")
      newErrors.content = "Content is required";
    if (!category) newErrors.category = "Category is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("content", content);
    if (excerpt.trim()) formData.append("excerpt", excerpt.trim());
    formData.append("category", category);
    formData.append("articleType", articleType);
    formData.append("status", publishStatus || status);
    if (author.trim()) formData.append("author", author.trim());
    if (tags.trim())
      formData.append(
        "tags",
        JSON.stringify(
          tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        ),
      );
    if (publishedAt)
      formData.append("publishedAt", new Date(publishedAt).toISOString());
    if (featuredImage) formData.append("featuredImage", featuredImage);
    if (ogImage) formData.append("ogImage", ogImage);

    onSubmit(formData);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* LEFT - TipTap Editor */}
      <div className="flex-1 lg:w-[65%] min-w-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TipTapEditor
            content={content}
            onChange={setContent}
            editable={!isSubmitting}
          />
          {errors.content && (
            <p className="text-xs text-red-500 mt-1">{errors.content}</p>
          )}
        </motion.div>
      </div>

      {/* RIGHT - Sidebar Fields */}
      <div className="lg:w-[35%] space-y-4 min-w-0">
        {/* Card 1: Metadata */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5 space-y-4"
        >
          <h3 className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark">
            📝 Metadata
          </h3>
          <Input
            label="Title"
            placeholder="Article title"
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
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief description (max 500 chars)"
              maxLength={500}
              rows={3}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] px-3 py-2 text-sm text-text-heading-light dark:text-text-heading-dark placeholder:text-text-para-light focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all resize-none disabled:opacity-50"
            />
            <p className="text-[10px] text-text-para-light mt-0.5 text-right">
              {excerpt.length}/500
            </p>
          </div>
          <Input
            label="Author"
            placeholder="Author name (optional)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            disabled={isSubmitting}
          />
        </motion.div>

        {/* Card 2: Classification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5 space-y-4"
        >
          <h3 className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark">
            📂 Classification
          </h3>
          <div>
            <label className="block text-sm font-medium text-text-heading-light dark:text-text-heading-dark mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setErrors((prev) => ({ ...prev, category: "" }));
              }}
              disabled={isSubmitting}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-[#0f172a] text-text-heading-light dark:text-text-heading-dark focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all ${errors.category ? "border-red-500" : "border-border-light dark:border-border-dark"}`}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-heading-light dark:text-text-heading-dark mb-2">
              Article Type
            </label>
            <div className="flex gap-2">
              {["MEDICAL", "POLITICAL"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setArticleType(type)}
                  disabled={isSubmitting}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${articleType === type ? "bg-brand-softbg dark:bg-brand-primary/10 text-brand-primary border-2 border-brand-primary" : "bg-gray-50 dark:bg-gray-800 text-text-para-light border-2 border-transparent"}`}
                >
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-heading-light dark:text-text-heading-dark mb-1">
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="medical, surgery, health (comma-separated)"
              disabled={isSubmitting}
              className="w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] px-3 py-2.5 text-sm text-text-heading-light dark:text-text-heading-dark placeholder:text-text-para-light focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all disabled:opacity-50"
            />
            {tags && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.split(",").map(
                  (tag, i) =>
                    tag.trim() && (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full bg-brand-softbg dark:bg-brand-primary/10 text-brand-primary text-xs font-medium"
                      >
                        {tag.trim()}
                      </span>
                    ),
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Card 3: Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5 space-y-4"
        >
          <h3 className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark">
            🖼️ Media
          </h3>
          <div>
            <label className="block text-sm font-medium text-text-heading-light dark:text-text-heading-dark mb-1">
              Featured Image
            </label>
            <div
              onClick={() => featuredInputRef.current?.click()}
              className="border-2 border-dashed border-border-light dark:border-border-dark rounded-xl p-6 text-center cursor-pointer hover:border-brand-primary transition-all"
            >
              {featuredPreview ? (
                <div className="relative">
                  <img
                    src={featuredPreview}
                    alt="Featured preview"
                    className="max-h-32 rounded-lg mx-auto"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFeaturedImage(null);
                      setFeaturedPreview("");
                    }}
                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                    type="button"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <FontAwesomeIcon
                    icon={faImage}
                    className="w-6 h-6 text-text-para-light"
                  />
                  <p className="text-xs text-text-para-light">
                    Click to upload (max 5MB)
                  </p>
                </div>
              )}
              <input
                ref={featuredInputRef}
                type="file"
                accept="image/*"
                onChange={handleFeaturedImage}
                className="hidden"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-heading-light dark:text-text-heading-dark mb-1">
              OG Image (Social Sharing)
            </label>
            <div
              onClick={() => ogInputRef.current?.click()}
              className="border-2 border-dashed border-border-light dark:border-border-dark rounded-xl p-6 text-center cursor-pointer hover:border-brand-primary transition-all"
            >
              {ogPreview ? (
                <div className="relative">
                  <img
                    src={ogPreview}
                    alt="OG preview"
                    className="max-h-32 rounded-lg mx-auto"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOgImage(null);
                      setOgPreview("");
                    }}
                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                    type="button"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <FontAwesomeIcon
                    icon={faImage}
                    className="w-6 h-6 text-text-para-light"
                  />
                  <p className="text-xs text-text-para-light">
                    Click to upload (max 5MB)
                  </p>
                </div>
              )}
              <input
                ref={ogInputRef}
                type="file"
                accept="image/*"
                onChange={handleOgImage}
                className="hidden"
              />
            </div>
          </div>
        </motion.div>

        {/* Card 4: Publishing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5 space-y-4 sticky top-20"
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
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${status === s ? "bg-brand-softbg dark:bg-brand-primary/10 text-brand-primary border-2 border-brand-primary" : "bg-gray-50 dark:bg-gray-800 text-text-para-light border-2 border-transparent"}`}
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

          {/* Submit Buttons */}
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
    </div>
  );
}

export default ArticleForm;
