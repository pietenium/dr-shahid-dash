/* eslint-disable no-unused-vars */
import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faSearch,
  faEye,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  getContactMessages,
  updateContactStatus,
  deleteContactMessage,
} from "@api/contact.api";
import { useDebounce } from "@hooks/useDebounce";
import { usePagination } from "@hooks/usePagination";
import { formatDate, formatRelativeTime } from "@utils/formatDate";
import PageHeader from "@components/shared/PageHeader";
import Button from "@components/ui/Button";
import StatusBadge from "@components/shared/StatusBadge";
import Pagination from "@components/ui/Pagination";
import ConfirmDialog from "@components/ui/ConfirmDialog";
import ContactDetailModal from "@components/contact/ContactDetailModal";
import EmptyState from "@components/ui/EmptyState";
import Tooltip from "@components/ui/Tooltip";
import { toast } from "sonner";
import { useNotifications } from "@context/NotificationContext";
import { joinRoom, leaveRoom } from "@lib/socket";

/**
 * Status tab configuration - simplified for isRead boolean backend
 * @constant {Array<{label: string, value: string, color: string}>}
 */
const STATUS_TABS = [
  { label: "All", value: "", color: "" },
  { label: "Unread", value: "unread", color: "bg-blue-500" },
  { label: "Read", value: "read", color: "bg-green-500" },
];

/**
 * ContactPage - Contact messages management
 *
 * Features:
 * - Status tabs with animated indicator (Unread/Read)
 * - Search by name, email, or subject
 * - Responsive table/card layout
 * - Detail modal with full message view
 * - Auto-mark as read on view
 * - Delete with confirmation
 */
function ContactPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search, 300);
  const { page, limit, goToPage, paginationParams } = usePagination({
    initialLimit: 10,
  });

  /**
   * Build query params
   */
  const queryParams = useMemo(
    () => ({
      ...paginationParams,
      isRead:
        activeTab === "read"
          ? true
          : activeTab === "unread"
            ? false
            : undefined,
      search: debouncedSearch || undefined,
    }),
    [paginationParams, activeTab, debouncedSearch],
  );

  /**
   * Fetch contact messages
   */
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ["contact", queryParams],
    queryFn: () => getContactMessages(queryParams),
    staleTime: 2 * 60 * 1000,
  });

  const messages = useMemo(
    () => messagesData?.data?.docs || [],
    [messagesData],
  );

  const pagination = useMemo(
    () => ({
      totalDocs: messagesData?.data?.totalDocs || 0,
      totalPages: messagesData?.data?.totalPages || 1,
      page: messagesData?.data?.page || 1,
      limit: messagesData?.data?.limit || 10,
      hasNextPage: messagesData?.data?.hasNextPage || false,
      hasPrevPage: messagesData?.data?.hasPrevPage || false,
    }),
    [messagesData],
  );

  /**
   * Mark as read mutation
   */
  const readMutation = useMutation({
    mutationFn: (id) => updateContactStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact"] });
    },
    onError: () => toast.error("Failed to mark as read"),
  });

  /**
   * Delete mutation
   */
  const deleteMutation = useMutation({
    mutationFn: deleteContactMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact"] });
      toast.success("Message deleted");
      setDeleteTarget(null);
      if (selectedMessage?._id === deleteTarget?._id) {
        setIsModalOpen(false);
        setSelectedMessage(null);
      }
    },
    onError: () => toast.error("Failed to delete message"),
  });

  /**
   * Open detail modal - auto mark as read if unread
   */
  const handleViewDetail = useCallback(
    (message) => {
      setSelectedMessage(message);
      setIsModalOpen(true);
      // Auto-mark as read if currently unread
      if (!message.isRead) {
        readMutation.mutate(message._id);
      }
    },
    [readMutation],
  );

  const hasActiveFilters = activeTab || search;

  const { resetContactUnread } = useNotifications();

  useEffect(() => {
    joinRoom("contacts");
    resetContactUnread();
    return () => leaveRoom("contacts");
  }, [resetContactUnread]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <PageHeader
        title="Contact Messages"
        subtitle="Manage inquiries from patients and visitors"
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Contact", active: true },
        ]}
      />

      {/* Status Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-1 overflow-x-auto pb-1 scrollbar-none"
      >
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value);
              goToPage(1);
            }}
            className={`
              relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
              ${
                activeTab === tab.value
                  ? "text-brand-primary bg-brand-softbg dark:bg-brand-primary/10"
                  : "text-text-para-light dark:text-text-para-dark hover:bg-gray-100 dark:hover:bg-gray-800"
              }
            `}
          >
            {tab.color && (
              <span className={`w-2 h-2 rounded-full ${tab.color}`} />
            )}
            {tab.label}
            {activeTab === tab.value && (
              <motion.div
                layoutId="contactTab"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-primary rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-4"
      >
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-para-light"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                goToPage(1);
              }}
              placeholder="Search by name, email, or subject..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] text-sm text-text-heading-light dark:text-text-heading-dark placeholder:text-text-para-light focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              </button>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setActiveTab("");
                setSearch("");
                goToPage(1);
              }}
              className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </motion.div>

      {/* Desktop Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="hidden md:block bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden"
      >
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="skeleton h-16 rounded-lg"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            title="No messages found"
            description={
              hasActiveFilters
                ? "Try adjusting your filters"
                : "No contact messages yet"
            }
            icon={faEnvelope}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-gray-900/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-para-light dark:text-text-para-dark uppercase tracking-wider">
                    Sender
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-para-light dark:text-text-para-dark uppercase tracking-wider hidden lg:table-cell">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-para-light dark:text-text-para-dark uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-para-light dark:text-text-para-dark uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-para-light dark:text-text-para-dark uppercase tracking-wider hidden sm:table-cell">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-para-light dark:text-text-para-dark uppercase tracking-wider w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <motion.tr
                    key={msg._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => handleViewDetail(msg)}
                    className={`
                      border-b border-border-light dark:border-border-dark cursor-pointer
                      hover:bg-brand-softbg/30 dark:hover:bg-brand-primary/5 transition-colors
                      ${!msg.isRead ? "bg-blue-50/30 dark:bg-blue-900/5" : ""}
                    `}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-softbg dark:bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-brand-primary">
                            {msg.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-sm truncate max-w-[140px] ${
                              !msg.isRead
                                ? "font-semibold text-text-heading-light dark:text-text-heading-dark"
                                : "font-medium text-text-heading-light dark:text-text-heading-dark"
                            }`}
                          >
                            {msg.name}
                          </p>
                          <p className="text-xs text-text-para-light dark:text-text-para-dark truncate max-w-[140px]">
                            {msg.email}
                          </p>
                        </div>
                        {!msg.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-text-heading-light dark:text-text-heading-dark truncate block max-w-[180px]">
                        {msg.subject || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-text-para-light dark:text-text-para-dark truncate block max-w-[200px]">
                        {msg.message}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={msg.isRead ? "READ" : "UNREAD"} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Tooltip
                        content={formatDate(
                          msg.createdAt,
                          "MMM dd, yyyy hh:mm a",
                        )}
                      >
                        <span className="text-xs text-text-para-light dark:text-text-para-dark cursor-help">
                          {formatRelativeTime(msg.createdAt)}
                        </span>
                      </Tooltip>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(msg);
                          }}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-text-para-light hover:text-brand-primary transition-all"
                          title="View details"
                        >
                          <FontAwesomeIcon
                            icon={faEye}
                            className="w-3.5 h-3.5"
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(msg);
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-para-light hover:text-red-500 transition-all"
                          title="Delete"
                        >
                          <FontAwesomeIcon
                            icon={faTrash}
                            className="w-3.5 h-3.5"
                          />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))
        ) : messages.length === 0 ? (
          <EmptyState
            title="No messages found"
            description={
              hasActiveFilters
                ? "Try adjusting your filters"
                : "No contact messages yet"
            }
            icon={faEnvelope}
          />
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleViewDetail(msg)}
              className={`
                bg-card-light dark:bg-card-dark rounded-xl border p-4 space-y-2.5 cursor-pointer
                ${
                  !msg.isRead
                    ? "border-l-4 border-l-blue-500"
                    : "border-border-light dark:border-border-dark"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-brand-softbg dark:bg-brand-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-brand-primary">
                      {msg.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-heading-light dark:text-text-heading-dark">
                      {msg.name}
                    </p>
                    <p className="text-xs text-text-para-light">{msg.email}</p>
                  </div>
                </div>
                <StatusBadge status={msg.isRead ? "READ" : "UNREAD"} />
              </div>
              {msg.subject && (
                <p className="text-sm font-medium text-text-heading-light dark:text-text-heading-dark">
                  {msg.subject}
                </p>
              )}
              <p className="text-xs text-text-para-light dark:text-text-para-dark line-clamp-2">
                {msg.message}
              </p>
              <p className="text-[10px] text-text-para-light">
                {formatRelativeTime(msg.createdAt)}
              </p>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          totalDocs={pagination.totalDocs}
          limit={limit}
          onPageChange={goToPage}
        />
      )}

      {/* Detail Modal */}
      <ContactDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMessage(null);
        }}
        message={selectedMessage}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        title="Delete Message"
        message={`Delete message from "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </motion.div>
  );
}

export default ContactPage;
