/* eslint-disable no-unused-vars */
import { memo, useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faStrikethrough,
  faUnderline,
  faHeading,
  faListUl,
  faListOl,
  faQuoteRight,
  faCode,
  faRulerHorizontal,
  faUndo,
  faRedo,
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify,
  faLink,
  faImage,
  faVideo,
  faFont,
  faTimes,
  faUpload,
  faSpinner,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@components/ui/Modal";
import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import { uploadImage } from "@api/article.api";
import { toast } from "sonner";

/**
 * Font family options for the editor
 * @constant {Array<{label: string, value: string}>}
 */
const FONT_OPTIONS = [
  { label: "Inter", value: "Inter" },
  { label: "Georgia", value: "Georgia" },
  { label: "Roboto Mono", value: "Roboto Mono" },
  { label: "Playfair Display", value: "Playfair Display" },
  { label: "Merriweather", value: "Merriweather" },
];

/**
 * TipTapEditor - Rich text editor with full toolbar
 *
 * Features:
 * - Full formatting toolbar with 5 rows
 * - Font family selector
 * - Link insertion modal
 * - Image insertion modal (URL + Upload tabs)
 * - Embed modal (YouTube/Vimeo)
 * - Undo/Redo support
 * - Character count
 * - Image upload with progress
 * - Paste sanitization
 *
 * @param {Object} props
 * @param {Object|null} props.content - Initial TipTap JSON content
 * @param {Function} props.onChange - Called with HTML content on change
 * @param {boolean} [props.editable=true] - Whether editor is editable
 */
const TipTapEditor = memo(function TipTapEditor({
  content,
  onChange,
  editable = true,
}) {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageTab, setImageTab] = useState("url");
  const [embedUrl, setEmbedUrl] = useState("");
  const [embedPreview, setEmbedPreview] = useState("");
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: { class: "rounded-lg max-w-full" },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#2FA084] underline hover:text-[#267D68]",
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      FontFamily.configure({ types: ["textStyle"] }),
      Underline,
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: "Start writing your article...",
      }),
    ],
    content: content || "",
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg max-w-none focus:outline-none",
      },
      handlePaste: (view, event) => {
        // Strip dangerous HTML but keep basic formatting
        const text = event.clipboardData?.getData("text/plain");
        if (text) {
          // Let TipTap handle paste sanitization
          return false;
        }
        return false;
      },
    },
  });

  if (!editor) return null;

  /**
   * Handle link insertion
   */
  const handleInsertLink = () => {
    if (!linkUrl) return;

    if (linkUrl && !linkUrl.startsWith("http")) {
      setLinkUrl("https://" + linkUrl);
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: linkUrl, target: linkNewTab ? "_blank" : null })
      .run();

    setLinkModalOpen(false);
    setLinkUrl("");
    setLinkText("");
    setLinkNewTab(false);
    toast.success("Link inserted");
  };

  /**
   * Handle image URL insertion
   */
  const handleInsertImageUrl = () => {
    if (!imageUrl) return;

    editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run();
    setImageModalOpen(false);
    setImageUrl("");
    setImageAlt("");
    toast.success("Image inserted");
  };

  /**
   * Handle image file upload
   */
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setImageUploading(true);
    try {
      const response = await uploadImage(file);
      const url = response.data?.url;
      if (url) {
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
        setImageModalOpen(false);
        toast.success("Image uploaded and inserted");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  /**
   * Handle embed URL insertion
   */
  const handleInsertEmbed = () => {
    if (!embedUrl) return;

    let embedHtml = "";
    const youtubeMatch = embedUrl.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
    );
    const vimeoMatch = embedUrl.match(/vimeo\.com\/(\d+)/);

    if (youtubeMatch) {
      embedHtml = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${youtubeMatch[1]}" frameborder="0" allowfullscreen></iframe>`;
    } else if (vimeoMatch) {
      embedHtml = `<iframe width="560" height="315" src="https://player.vimeo.com/video/${vimeoMatch[1]}" frameborder="0" allowfullscreen></iframe>`;
    } else {
      toast.error("Invalid YouTube or Vimeo URL");
      return;
    }

    editor.chain().focus().insertContent(embedHtml).run();
    setEmbedModalOpen(false);
    setEmbedUrl("");
    setEmbedPreview("");
    toast.success("Embed inserted");
  };

  /**
   * Toolbar button component
   */
  const ToolbarButton = ({
    icon,
    active,
    onClick,
    title,
    disabled = false,
  }) => (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-2 rounded-lg transition-all duration-200
        disabled:opacity-40 disabled:cursor-not-allowed
        ${
          active
            ? "bg-brand-softbg dark:bg-brand-primary/20 text-brand-primary"
            : "text-text-para-light dark:text-text-para-dark hover:bg-gray-100 dark:hover:bg-gray-700"
        }
      `}
    >
      <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" />
    </motion.button>
  );

  return (
    <div className="border border-border-light dark:border-border-dark rounded-xl overflow-hidden bg-card-light dark:bg-card-dark">
      {/* Toolbar - 5 rows */}
      {editable && (
        <div className="border-b border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-gray-900/30 p-2 space-y-1.5">
          {/* Row 1: Headings + Formatting */}
          <div className="flex items-center gap-1 flex-wrap">
            <ToolbarButton
              icon={faHeading}
              active={editor.isActive("heading", { level: 1 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              title="Heading 1"
            />
            <ToolbarButton
              icon={faHeading}
              active={editor.isActive("heading", { level: 2 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              title="Heading 2"
            />
            <ToolbarButton
              icon={faHeading}
              active={editor.isActive("heading", { level: 3 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              title="Heading 3"
            />
            <span className="w-px h-6 bg-border-light dark:bg-border-dark mx-1" />
            <ToolbarButton
              icon={faBold}
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold"
            />
            <ToolbarButton
              icon={faItalic}
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic"
            />
            <ToolbarButton
              icon={faStrikethrough}
              active={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Strikethrough"
            />
            <ToolbarButton
              icon={faUnderline}
              active={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Underline"
            />
          </div>

          {/* Row 2: Font Family */}
          <div className="flex items-center gap-1">
            <FontAwesomeIcon
              icon={faFont}
              className="w-3 h-3 text-text-para-light dark:text-text-para-dark ml-1"
            />
            <select
              onChange={(e) =>
                editor.chain().focus().setFontFamily(e.target.value).run()
              }
              className="text-xs bg-transparent border border-border-light dark:border-border-dark rounded px-2 py-1 text-text-heading-light dark:text-text-heading-dark focus:outline-none focus:ring-1 focus:ring-brand-primary"
              value={editor.getAttributes("textStyle").fontFamily || "Inter"}
            >
              {FONT_OPTIONS.map((font) => (
                <option
                  key={font.value}
                  value={font.value}
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* Row 3: Alignment */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              icon={faAlignLeft}
              active={editor.isActive({ textAlign: "left" })}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              title="Align Left"
            />
            <ToolbarButton
              icon={faAlignCenter}
              active={editor.isActive({ textAlign: "center" })}
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              title="Align Center"
            />
            <ToolbarButton
              icon={faAlignRight}
              active={editor.isActive({ textAlign: "right" })}
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              title="Align Right"
            />
            <ToolbarButton
              icon={faAlignJustify}
              active={editor.isActive({ textAlign: "justify" })}
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
              title="Justify"
            />
          </div>

          {/* Row 4: Lists + Block */}
          <div className="flex items-center gap-1 flex-wrap">
            <ToolbarButton
              icon={faListUl}
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bullet List"
            />
            <ToolbarButton
              icon={faListOl}
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Ordered List"
            />
            <ToolbarButton
              icon={faQuoteRight}
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="Blockquote"
            />
            <ToolbarButton
              icon={faCode}
              active={editor.isActive("codeBlock")}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              title="Code Block"
            />
            <ToolbarButton
              icon={faRulerHorizontal}
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Horizontal Rule"
            />
          </div>

          {/* Row 5: Insert + Undo/Redo */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              icon={faLink}
              active={editor.isActive("link")}
              onClick={() => setLinkModalOpen(true)}
              title="Insert Link"
            />
            <ToolbarButton
              icon={faImage}
              onClick={() => setImageModalOpen(true)}
              title="Insert Image"
            />
            <ToolbarButton
              icon={faVideo}
              onClick={() => setEmbedModalOpen(true)}
              title="Embed Video"
            />
            <span className="w-px h-6 bg-border-light dark:bg-border-dark mx-1" />
            <ToolbarButton
              icon={faUndo}
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
            />
            <ToolbarButton
              icon={faRedo}
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
            />
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="min-h-[500px]">
        <EditorContent editor={editor} className="p-4 sm:p-6" />
      </div>

      {/* Character count */}
      {editable && (
        <div className="px-4 py-2 border-t border-border-light dark:border-border-dark text-xs text-text-para-light dark:text-text-para-dark">
          {editor.storage.characterCount?.characters?.() ||
            editor.getText().length}{" "}
          characters
        </div>
      )}

      {/* ============ LINK MODAL ============ */}
      <Modal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title="Insert Link"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="URL"
            type="url"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
          <Input
            label="Display Text (optional)"
            placeholder="Link text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={linkNewTab}
              onChange={(e) => setLinkNewTab(e.target.checked)}
              className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
            />
            <span className="text-sm text-text-para-light dark:text-text-para-dark">
              Open in new tab
            </span>
          </label>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleInsertLink}
              disabled={!linkUrl}
            >
              Insert Link
            </Button>
          </div>
        </div>
      </Modal>

      {/* ============ IMAGE MODAL ============ */}
      <Modal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        title="Insert Image"
        size="md"
      >
        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {["url", "upload"].map((tab) => (
            <button
              key={tab}
              onClick={() => setImageTab(tab)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${imageTab === tab ? "bg-white dark:bg-gray-700 text-text-heading-light dark:text-text-heading-dark shadow-sm" : "text-text-para-light dark:text-text-para-dark"}`}
            >
              {tab === "url" ? "Image URL" : "Upload Image"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {imageTab === "url" ? (
            <motion.div
              key="url"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Input
                label="Image URL"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Input
                label="Alt Text"
                placeholder="Describe the image"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-40 rounded-lg object-cover"
                />
              )}
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setImageModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleInsertImageUrl}
                  disabled={!imageUrl}
                >
                  Insert
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border-light dark:border-border-dark rounded-xl p-8 text-center cursor-pointer hover:border-brand-primary hover:bg-brand-softbg/30 dark:hover:bg-brand-primary/5 transition-all"
              >
                {imageUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="w-8 h-8 text-brand-primary animate-spin"
                    />
                    <p className="text-sm text-text-para-light">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FontAwesomeIcon
                      icon={faUpload}
                      className="w-8 h-8 text-brand-primary"
                    />
                    <p className="text-sm font-medium text-text-heading-light dark:text-text-heading-dark">
                      Click or drag to upload
                    </p>
                    <p className="text-xs text-text-para-light">
                      JPG, PNG, WebP, GIF (max 5MB)
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>

      {/* ============ EMBED MODAL ============ */}
      <Modal
        isOpen={embedModalOpen}
        onClose={() => setEmbedModalOpen(false)}
        title="Embed Video"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="YouTube or Vimeo URL"
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={embedUrl}
            onChange={(e) => {
              setEmbedUrl(e.target.value);
              const ytMatch = e.target.value.match(
                /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
              );
              const vmMatch = e.target.value.match(/vimeo\.com\/(\d+)/);
              if (ytMatch)
                setEmbedPreview(`https://www.youtube.com/embed/${ytMatch[1]}`);
              else if (vmMatch)
                setEmbedPreview(`https://player.vimeo.com/video/${vmMatch[1]}`);
              else setEmbedPreview("");
            }}
          />

          {embedPreview && (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={embedPreview}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                title="Video preview"
              />
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setEmbedModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleInsertEmbed}
              disabled={!embedPreview}
            >
              Insert Video
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

export default TipTapEditor;
