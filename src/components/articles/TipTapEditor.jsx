/* eslint-disable react-hooks/static-components */
/* eslint-disable no-unused-vars */
import { memo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useEditor,
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import { Node, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
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
  faChevronDown,
  faTable,
  faPlus,
  faTrash,
  faMinus,
  faGripLines,
  faColumns,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "@components/ui/Modal";
import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import { uploadImage } from "@api/article.api";
import { toast } from "sonner";

// ─────────────────────────────────────────────
//  CSS injected for table rendering + iframe
// ─────────────────────────────────────────────
const EDITOR_CSS = `
  .ProseMirror .tableWrapper { overflow-x: auto; margin: 1em 0; }
  .ProseMirror table {
    border-collapse: collapse;
    width: 100%;
    table-layout: fixed;
  }
  .ProseMirror td,
  .ProseMirror th {
    border: 1px solid #d1d5db;
    padding: 7px 12px;
    min-width: 60px;
    vertical-align: top;
    position: relative;
    box-sizing: border-box;
  }
  .ProseMirror th {
    background-color: #f3f4f6;
    font-weight: 600;
    text-align: left;
  }
  .dark .ProseMirror th { background-color: #1f2937; }
  .dark .ProseMirror td,
  .dark .ProseMirror th { border-color: #374151; }
  .ProseMirror .selectedCell::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(47, 160, 132, 0.15);
    pointer-events: none;
    z-index: 2;
  }
  .ProseMirror .column-resize-handle {
    width: 4px;
    background-color: #2FA084;
    position: absolute;
    right: -2px;
    top: 0; bottom: 0;
    cursor: col-resize;
    z-index: 3;
  }
  .ProseMirror .embed-wrapper {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    border-radius: 10px;
    margin: 1em 0;
    background: #000;
  }
  .ProseMirror .embed-wrapper iframe {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    border: 0;
  }
  
  /* ===== FIXED LIST STYLES ===== */
  .ProseMirror ul {
    list-style-type: disc !important;
    padding-left: 1.5em !important;
    margin: 0.5em 0 !important;
  }
  .ProseMirror ul li {
    list-style-type: disc !important;
    display: list-item !important;
    padding-left: 0.25em !important;
    margin: 0.25em 0 !important;
  }
  .ProseMirror ul ul {
    list-style-type: circle !important;
  }
  .ProseMirror ul ul ul {
    list-style-type: square !important;
  }
  .ProseMirror ol {
    list-style-type: decimal !important;
    padding-left: 1.5em !important;
    margin: 0.5em 0 !important;
  }
  .ProseMirror ol li {
    list-style-type: decimal !important;
    display: list-item !important;
    padding-left: 0.25em !important;
    margin: 0.25em 0 !important;
  }
  .ProseMirror ol ol {
    list-style-type: lower-alpha !important;
  }
  .ProseMirror ol ol ol {
    list-style-type: lower-roman !important;
  }
`;

// ─────────────────────────────────────────────
//  Font options
// ─────────────────────────────────────────────
const FONT_OPTIONS = [
  { label: "Inter", value: "Inter" },
  { label: "Georgia", value: "Georgia" },
  { label: "Roboto Mono", value: "Roboto Mono" },
  { label: "Playfair Display", value: "Playfair Display" },
  { label: "Merriweather", value: "Merriweather" },
];

// ─────────────────────────────────────────────
//  Custom Iframe Node Extension
//  Fixes the "shows as link text" bug by using
//  a proper block node instead of raw HTML.
// ─────────────────────────────────────────────
const IframeExtension = Node.create({
  name: "iframe",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: "560" },
      height: { default: "315" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-embed] iframe",
        getAttrs: (el) => ({ src: el.getAttribute("src") }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "embed-wrapper", "data-embed": "true" },
      [
        "iframe",
        mergeAttributes(
          { src: HTMLAttributes.src },
          { frameborder: "0", allowfullscreen: "true", loading: "lazy" },
        ),
      ],
    ];
  },

  addCommands() {
    return {
      insertIframe:
        (options) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: options }),
    };
  },
});

// ─────────────────────────────────────────────
//  Resizable Image Node View (React component)
// ─────────────────────────────────────────────
const ResizableImageView = ({ node, updateAttributes, selected }) => {
  const { src, alt, width } = node.attrs;
  const currentWidth =
    typeof width === "number" ? width : parseInt(width) || 480;

  const resize = (e, delta) => {
    e.preventDefault();
    e.stopPropagation();
    const next = Math.min(Math.max(currentWidth + delta, 80), 1400);
    updateAttributes({ width: next });
  };

  return (
    <NodeViewWrapper className="block" draggable="true" data-drag-handle>
      <div
        className={`group relative inline-block transition-all duration-150 ${
          selected ? "ring-2 ring-brand-primary ring-offset-2 rounded-lg" : ""
        }`}
        style={{ maxWidth: "100%" }}
      >
        <img
          src={src}
          alt={alt || ""}
          draggable={false}
          style={{ width: currentWidth, maxWidth: "100%", display: "block" }}
          className="rounded-lg"
        />

        {/* Resize controls — appear on hover or selection */}
        <div
          className={`absolute bottom-2 right-2 flex gap-1 transition-all duration-200 ${
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <button
            onMouseDown={(e) => resize(e, -60)}
            title="Decrease size"
            className="flex items-center justify-center w-7 h-7 bg-black/75 backdrop-blur-sm text-white rounded-lg hover:bg-black transition-colors shadow-lg font-bold text-base"
          >
            −
          </button>
          <button
            onMouseDown={(e) => resize(e, 60)}
            title="Increase size"
            className="flex items-center justify-center w-7 h-7 bg-black/75 backdrop-blur-sm text-white rounded-lg hover:bg-black transition-colors shadow-lg font-bold text-base"
          >
            +
          </button>
        </div>

        {/* Size badge */}
        <div
          className={`absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded font-mono transition-all duration-200 ${
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {currentWidth}px
        </div>
      </div>
    </NodeViewWrapper>
  );
};

// Extend Image with resizable node view + width attribute
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attrs) => (attrs.width ? { width: attrs.width } : {}),
        parseHTML: (el) => el.getAttribute("width"),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

// ─────────────────────────────────────────────
//  Generic Dropdown component
// ─────────────────────────────────────────────
const Dropdown = ({ label, icon, children, active, className = "" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 select-none ${
          active
            ? "bg-brand-softbg dark:bg-brand-primary/20 text-brand-primary"
            : "text-text-para-light dark:text-text-para-dark hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        {icon && <FontAwesomeIcon icon={icon} className="w-3 h-3 shrink-0" />}
        <span>{label}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`w-2.5 h-2.5 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.13, ease: "easeOut" }}
            className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark rounded-xl shadow-xl z-50 min-w-[170px] py-1.5 overflow-hidden"
          >
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DropdownItem = ({ icon, label, active, onClick, danger = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-100 ${
      danger
        ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        : active
          ? "bg-brand-softbg/60 dark:bg-brand-primary/15 text-brand-primary"
          : "text-text-heading-light dark:text-text-heading-dark hover:bg-gray-50 dark:hover:bg-gray-700"
    }`}
  >
    {icon && <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5 shrink-0" />}
    <span>{label}</span>
  </button>
);

const DropdownDivider = () => (
  <div className="my-1 border-t border-border-light dark:border-border-dark" />
);

// ─────────────────────────────────────────────
//  Main TipTapEditor Component
// ─────────────────────────────────────────────
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

  // Inject CSS once on mount
  useEffect(() => {
    const id = "tiptap-editor-styles";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = EDITOR_CSS;
      document.head.appendChild(style);
    }
    return () => {};
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      ResizableImage.configure({ allowBase64: false }),
      IframeExtension,
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
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: "Start writing your article..." }),
    ],
    content: content || "",
    editable,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg max-w-none focus:outline-none",
      },
      handlePaste: () => false,
    },
  });

  if (!editor) return null;

  // ── Handlers ──────────────────────────────

  const handleInsertLink = () => {
    if (!linkUrl) return;
    const url = linkUrl.startsWith("http") ? linkUrl : "https://" + linkUrl;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url, target: linkNewTab ? "_blank" : null })
      .run();
    setLinkModalOpen(false);
    setLinkUrl("");
    setLinkText("");
    setLinkNewTab(false);
    toast.success("Link inserted");
  };

  const handleInsertImageUrl = () => {
    if (!imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run();
    setImageModalOpen(false);
    setImageUrl("");
    setImageAlt("");
    toast.success("Image inserted");
  };

  const handleImageUpload = async (e) => {
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
    setImageUploading(true);
    try {
      const response = await uploadImage(file);
      const url = response.data?.url;
      if (url) {
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
        setImageModalOpen(false);
        toast.success("Image uploaded and inserted");
      }
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  // FIX: use insertIframe command (custom node) instead of raw HTML string
  const handleInsertEmbed = () => {
    if (!embedPreview) return;
    editor.chain().focus().insertIframe({ src: embedPreview }).run();
    setEmbedModalOpen(false);
    setEmbedUrl("");
    setEmbedPreview("");
    toast.success("Video embedded");
  };

  const handleEmbedUrlChange = (val) => {
    setEmbedUrl(val);
    const ytMatch = val.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
    );
    const vmMatch = val.match(/vimeo\.com\/(\d+)/);
    if (ytMatch) setEmbedPreview(`https://www.youtube.com/embed/${ytMatch[1]}`);
    else if (vmMatch)
      setEmbedPreview(`https://player.vimeo.com/video/${vmMatch[1]}`);
    else setEmbedPreview("");
  };

  const insertTable = (close) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
    close();
    toast.success("Table inserted");
  };

  // ── Helper: active heading label ───────────
  const activeHeadingLabel = () => {
    if (editor.isActive("heading", { level: 1 })) return "H1";
    if (editor.isActive("heading", { level: 2 })) return "H2";
    if (editor.isActive("heading", { level: 3 })) return "H3";
    return "Normal";
  };

  const activeAlignLabel = () => {
    if (editor.isActive({ textAlign: "center" })) return "Center";
    if (editor.isActive({ textAlign: "right" })) return "Right";
    if (editor.isActive({ textAlign: "justify" })) return "Justify";
    return "Left";
  };

  const activeFont = editor.getAttributes("textStyle").fontFamily || "Inter";

  // ── Toolbar Button ─────────────────────────
  const ToolbarButton = ({
    icon,
    active,
    onClick,
    title,
    disabled = false,
  }) => (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? "bg-brand-softbg dark:bg-brand-primary/20 text-brand-primary"
          : "text-text-para-light dark:text-text-para-dark hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" />
    </motion.button>
  );

  const Divider = () => (
    <span className="w-px h-5 bg-border-light dark:bg-border-dark mx-0.5 shrink-0" />
  );

  // ── Render ─────────────────────────────────
  return (
    <div className="border border-border-light dark:border-border-dark rounded-xl overflow-hidden bg-card-light dark:bg-card-dark shadow-sm">
      {/* Toolbar */}
      {editable && (
        <div className="sticky top-0 z-30 border-b border-border-light dark:border-border-dark bg-gradient-to-b from-gray-50/95 to-gray-50/50 dark:from-gray-900/95 dark:to-gray-900/50 backdrop-blur-md px-3 py-2 shadow-sm">
          {/* Single row - all controls in a clean horizontal layout */}
          <div className="flex items-center gap-0.5 flex-wrap">
            {/* ========== Headings Dropdown ========== */}
            <Dropdown
              label={activeHeadingLabel()}
              icon={faHeading}
              active={editor.isActive("heading")}
            >
              {(close) => (
                <>
                  <DropdownItem
                    label="Normal"
                    active={!editor.isActive("heading")}
                    onClick={() => {
                      editor.chain().focus().setParagraph().run();
                      close();
                    }}
                  />
                  <DropdownItem
                    label="Heading 1"
                    active={editor.isActive("heading", { level: 1 })}
                    onClick={() => {
                      editor.chain().focus().toggleHeading({ level: 1 }).run();
                      close();
                    }}
                  />
                  <DropdownItem
                    label="Heading 2"
                    active={editor.isActive("heading", { level: 2 })}
                    onClick={() => {
                      editor.chain().focus().toggleHeading({ level: 2 }).run();
                      close();
                    }}
                  />
                  <DropdownItem
                    label="Heading 3"
                    active={editor.isActive("heading", { level: 3 })}
                    onClick={() => {
                      editor.chain().focus().toggleHeading({ level: 3 }).run();
                      close();
                    }}
                  />
                </>
              )}
            </Dropdown>

            <Divider />

            {/* ========== Bold, Italic, Strike, Underline ========== */}
            <ToolbarButton
              icon={faBold}
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold (Ctrl+B)"
            />
            <ToolbarButton
              icon={faItalic}
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic (Ctrl+I)"
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
              title="Underline (Ctrl+U)"
            />

            <Divider />

            {/* ========== Font Dropdown ========== */}
            <Dropdown label={activeFont} icon={faFont}>
              {(close) =>
                FONT_OPTIONS.map((f) => (
                  <DropdownItem
                    key={f.value}
                    label={f.label}
                    active={activeFont === f.value}
                    onClick={() => {
                      editor.chain().focus().setFontFamily(f.value).run();
                      close();
                    }}
                  />
                ))
              }
            </Dropdown>

            <Divider />

            {/* ========== Alignment Dropdown ========== */}
            <Dropdown label={activeAlignLabel()} icon={faAlignLeft}>
              {(close) => (
                <>
                  <DropdownItem
                    icon={faAlignLeft}
                    label="Align Left"
                    active={editor.isActive({ textAlign: "left" })}
                    onClick={() => {
                      editor.chain().focus().setTextAlign("left").run();
                      close();
                    }}
                  />
                  <DropdownItem
                    icon={faAlignCenter}
                    label="Align Center"
                    active={editor.isActive({ textAlign: "center" })}
                    onClick={() => {
                      editor.chain().focus().setTextAlign("center").run();
                      close();
                    }}
                  />
                  <DropdownItem
                    icon={faAlignRight}
                    label="Align Right"
                    active={editor.isActive({ textAlign: "right" })}
                    onClick={() => {
                      editor.chain().focus().setTextAlign("right").run();
                      close();
                    }}
                  />
                  <DropdownItem
                    icon={faAlignJustify}
                    label="Justify"
                    active={editor.isActive({ textAlign: "justify" })}
                    onClick={() => {
                      editor.chain().focus().setTextAlign("justify").run();
                      close();
                    }}
                  />
                </>
              )}
            </Dropdown>

            <Divider />

            {/* ========== Lists ========== */}
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

            <Divider />

            {/* ========== Block Elements ========== */}
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

            <Divider />

            {/* ========== Insert: Link, Image, Video ========== */}
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

            <Divider />

            {/* ========== Table Dropdown ========== */}
            <Dropdown
              label="Table"
              icon={faTable}
              active={editor.isActive("table")}
            >
              {(close) => (
                <>
                  <DropdownItem
                    icon={faTable}
                    label="Insert Table (3×3)"
                    onClick={() => insertTable(close)}
                  />
                  {editor.isActive("table") && (
                    <>
                      <DropdownDivider />
                      <p className="px-3 py-1 text-[10px] font-semibold uppercase text-text-para-light dark:text-text-para-dark tracking-wider">
                        Rows
                      </p>
                      <DropdownItem
                        icon={faPlus}
                        label="Add Row Above"
                        onClick={() => {
                          editor.chain().focus().addRowBefore().run();
                          close();
                        }}
                      />
                      <DropdownItem
                        icon={faPlus}
                        label="Add Row Below"
                        onClick={() => {
                          editor.chain().focus().addRowAfter().run();
                          close();
                        }}
                      />
                      <DropdownItem
                        icon={faTrash}
                        label="Delete Row"
                        danger
                        onClick={() => {
                          editor.chain().focus().deleteRow().run();
                          close();
                        }}
                      />
                      <DropdownDivider />
                      <p className="px-3 py-1 text-[10px] font-semibold uppercase text-text-para-light dark:text-text-para-dark tracking-wider">
                        Columns
                      </p>
                      <DropdownItem
                        icon={faPlus}
                        label="Add Column Left"
                        onClick={() => {
                          editor.chain().focus().addColumnBefore().run();
                          close();
                        }}
                      />
                      <DropdownItem
                        icon={faPlus}
                        label="Add Column Right"
                        onClick={() => {
                          editor.chain().focus().addColumnAfter().run();
                          close();
                        }}
                      />
                      <DropdownItem
                        icon={faTrash}
                        label="Delete Column"
                        danger
                        onClick={() => {
                          editor.chain().focus().deleteColumn().run();
                          close();
                        }}
                      />
                      <DropdownDivider />
                      <DropdownItem
                        icon={faTrash}
                        label="Delete Table"
                        danger
                        onClick={() => {
                          editor.chain().focus().deleteTable().run();
                          close();
                        }}
                      />
                    </>
                  )}
                </>
              )}
            </Dropdown>

            <Divider />

            {/* ========== Undo / Redo ========== */}
            <ToolbarButton
              icon={faUndo}
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo (Ctrl+Z)"
            />
            <ToolbarButton
              icon={faRedo}
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo (Ctrl+Y)"
            />
          </div>
        </div>
      )}

      {/* Editor content area */}
      <div className="min-h-[500px] max-h-[calc(100vh-250px)] overflow-y-auto">
        <EditorContent editor={editor} className="p-4 sm:p-6" />
      </div>

      {/* Character count */}
      {editable && (
        <div className="px-4 py-2 border-t border-border-light dark:border-border-dark text-xs text-text-para-light dark:text-text-para-dark flex items-center justify-between">
          <span>{editor.getText().length.toLocaleString()} characters</span>
          {editor.isActive("table") && (
            <span className="text-brand-primary font-medium">
              Table selected — use Table menu to edit rows/columns
            </span>
          )}
        </div>
      )}

      {/* ── LINK MODAL ── */}
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

      {/* ── IMAGE MODAL ── */}
      <Modal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        title="Insert Image"
        size="md"
      >
        <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {["url", "upload"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setImageTab(tab)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-150 ${
                imageTab === tab
                  ? "bg-white dark:bg-gray-700 text-text-heading-light dark:text-text-heading-dark shadow-sm"
                  : "text-text-para-light dark:text-text-para-dark"
              }`}
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
              transition={{ duration: 0.15 }}
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
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
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
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border-light dark:border-border-dark rounded-xl p-8 text-center cursor-pointer hover:border-brand-primary hover:bg-brand-softbg/30 dark:hover:bg-brand-primary/5 transition-all duration-200"
              >
                {imageUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="w-8 h-8 text-brand-primary animate-spin"
                    />
                    <p className="text-sm text-text-para-light">Uploading…</p>
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

      {/* ── EMBED MODAL ── */}
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
            onChange={(e) => handleEmbedUrlChange(e.target.value)}
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
