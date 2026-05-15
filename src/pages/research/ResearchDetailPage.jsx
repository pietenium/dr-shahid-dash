/* eslint-disable no-unused-vars */
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faArrowLeft,
  faCalendar,
  faFilePdf,
  faLink,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { getResearchBySlug } from "@api/research.api";
import { formatDate } from "@utils/formatDate";
import PageHeader from "@components/shared/PageHeader";
import Button from "@components/ui/Button";
import StatusBadge from "@components/shared/StatusBadge";
import Badge from "@components/ui/Badge";
import Spinner from "@components/ui/Spinner";

/**
 * Article detail page output styles for rendered content
 * @constant {string}
 */
const DETAIL_CSS = `
  .research-detail p { margin: 0.5rem 0; line-height: 1.75; }
  .research-detail a { color: #2FA084; text-decoration: underline; }
  .dark .research-detail p { color: #d1d5db; }
`;

/**
 * ResearchDetailPage - Read-only detail view of research paper
 * Shows thumbnail, metadata, description, and access links
 */
function ResearchDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["research", "detail", id],
    queryFn: async () => {
      // First get paper to find its slug
      const { default: api } = await import("@api/axios");
      const listRes = await api.get("/research/admin", {
        params: { limit: 100 },
      });
      const paper = listRes.data?.data?.find((p) => p._id === id);
      if (!paper) throw new Error("Research paper not found");
      // Then get full detail by slug
      const detailRes = await getResearchBySlug(paper.slug);
      return detailRes.data;
    },
  });

  useEffect(() => {
    const styleId = "research-detail-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = DETAIL_CSS;
      document.head.appendChild(style);
    }
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  const paper = data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !paper) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-2">Research Paper Not Found</h2>
        <Button variant="primary" onClick={() => navigate("/research")}>
          Back to Research
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <PageHeader
        title={paper.title}
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Research", path: "/research" },
          { label: paper.title, active: true },
        ]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/research")}
              leftIcon={faArrowLeft}
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/research/${paper._id}/edit`)}
              leftIcon={faEdit}
            >
              Edit
            </Button>
          </div>
        }
      />

      {/* Hero / Thumbnail */}
      {paper.thumbnailImage?.url && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl overflow-hidden max-h-80"
        >
          <img
            src={paper.thumbnailImage.url}
            alt={paper.title}
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}

      {/* Metadata Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-3 p-4 bg-card-light dark:bg-card-dark rounded-xl border"
      >
        <Badge variant={paper.uploadType === "PDF" ? "danger" : "info"}>
          {paper.uploadType === "PDF" ? "📄 PDF" : "🔗 DOI"}
        </Badge>
        <StatusBadge status={paper.status} />
        <span className="text-xs text-text-para-light flex items-center gap-1">
          <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
          Published:{" "}
          {formatDate(paper.publishedAt || paper.createdAt, "MMM dd, yyyy")}
        </span>
        <span className="text-xs text-text-para-light">
          Created: {formatDate(paper.createdAt, "MMM dd, yyyy")}
        </span>
      </motion.div>

      {/* Description */}
      {paper.description && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card-light dark:bg-card-dark rounded-xl border p-6"
        >
          <h3 className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark mb-3">
            Description
          </h3>
          <div className="research-detail text-sm text-text-para-light dark:text-text-para-dark whitespace-pre-wrap">
            {paper.description}
          </div>
        </motion.div>
      )}

      {/* Access Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border p-6"
      >
        <h3 className="text-sm font-semibold text-text-heading-light dark:text-text-heading-dark mb-4">
          Access Paper
        </h3>

        {paper.uploadType === "PDF" && paper.pdfFile?.url ? (
          <a
            href={paper.pdfFile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-red-500/25"
          >
            <FontAwesomeIcon icon={faFilePdf} className="w-5 h-5" />
            Download / View PDF
            <FontAwesomeIcon icon={faExternalLinkAlt} className="w-3 h-3" />
          </a>
        ) : paper.uploadType === "DOI" && paper.doiUrl ? (
          <div className="space-y-3">
            <a
              href={paper.doiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-blue-500/25"
            >
              <FontAwesomeIcon icon={faLink} className="w-5 h-5" />
              View on DOI.org
              <FontAwesomeIcon icon={faExternalLinkAlt} className="w-3 h-3" />
            </a>
            {paper.doiNumber && (
              <p className="text-xs text-text-para-light dark:text-text-para-dark font-mono">
                DOI: {paper.doiNumber}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-text-para-light">
            No access link available for this paper.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

export default ResearchDetailPage;
