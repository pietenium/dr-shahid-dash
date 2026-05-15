/* eslint-disable no-unused-vars */
import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faTrashAlt,
  faFilter,
  faCheckSquare,
  faSquare,
  faMinusSquare,
  faXmark,
  faShieldHalved,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import {
  getActivityLogs,
  deleteLog,
  bulkDeleteLogs,
  clearAllLogs,
} from "@api/activityLog.api";
import { useAuth } from "@hooks/useAuth";
import { usePagination } from "@hooks/usePagination";
import { formatDate, formatRelativeTime } from "@utils/formatDate";
import PageHeader from "@components/shared/PageHeader";
import Button from "@components/ui/Button";
import Badge from "@components/ui/Badge";
import Avatar from "@components/ui/Avatar";
import Tooltip from "@components/ui/Tooltip";
import Pagination from "@components/ui/Pagination";
import ConfirmDialog from "@components/ui/ConfirmDialog";
import EmptyState from "@components/ui/EmptyState";
import { toast } from "sonner";

/**
 * Module badge color mapping
 * @constant {Object.<string, string>}
 */
const MODULE_COLORS = {
  articles: "success",
  research: "info",
  auth: "purple",
  appointments: "warning",
  contact: "info",
  users: "purple",
  "app-info": "default",
  testimonials: "warning",
  "article-category": "success",
  upload: "info",
  analytics: "info",
};

/**
 * Module filter options
 * @constant {string[]}
 */
const MODULE_OPTIONS = [
  "articles",
  "article-category",
  "research",
  "testimonials",
  "appointments",
  "contact",
  "users",
  "auth",
  "app-info",
  "upload",
  "analytics",
];

/**
 * Items per page options
 * @constant {number[]}
 */
const LIMIT_OPTIONS = [20, 50, 100];

/**
 * ActivityLogsPage - Activity log viewer with filters and bulk actions
 *
 * Features:
 * - Role-based scoping (ADMIN sees all, MODERATOR sees own)
 * - Info banner showing current role context
 * - Date range pickers, module filter, user filter (ADMIN only)
 * - Bulk selection with floating action bar
 * - Clear all with role-specific confirmation message
 * - Responsive table with mobile cards
 * - Relative timestamps with tooltip for full date
 */
function ActivityLogsPage() {
  const queryClient = useQueryClient();
  const { user: currentUser, isAdmin } = useAuth();

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Confirmation dialogs
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  const { page, limit, goToPage, setPageSize, paginationParams } =
    usePagination({ initialLimit: 20 });

  /**
   * Build query params
   */
  const queryParams = useMemo(
    () => ({
      ...paginationParams,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      module: moduleFilter || undefined,
      user: isAdmin && userFilter ? userFilter : undefined,
    }),
    [paginationParams, startDate, endDate, moduleFilter, userFilter, isAdmin],
  );

  /**
   * Fetch activity logs
   */
  const { data: logsData, isLoading } = useQuery({
    queryKey: ["activity-logs", queryParams],
    queryFn: () => getActivityLogs(queryParams),
    staleTime: 1 * 60 * 1000,
  });

  const logs = useMemo(() => logsData?.data?.docs || [], [logsData]);
  const pagination = useMemo(
    () => ({
      totalDocs: logsData?.data?.totalDocs || 0,
      totalPages: logsData?.data?.totalPages || 0,
    }),
    [logsData],
  );

  /**
   * Single delete mutation
   */
  const deleteMutation = useMutation({
    mutationFn: deleteLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
      toast.success("Log entry deleted");
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete log");
    },
  });

  /**
   * Bulk delete mutation
   */
  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteLogs,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
      toast.success(
        `${data.data?.deletedCount || selectedIds.length} logs deleted`,
      );
      setSelectedIds([]);
      setSelectAll(false);
      setShowBulkDeleteConfirm(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete logs");
    },
  });

  /**
   * Clear all mutation
   */
  const clearAllMutation = useMutation({
    mutationFn: clearAllLogs,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
      toast.success(`${data.data?.deletedCount || 0} logs cleared`);
      setShowClearAllConfirm(false);
      goToPage(1);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to clear logs");
    },
  });

  /**
   * Toggle single row selection
   */
  const toggleSelection = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  /**
   * Toggle select all visible rows
   */
  const toggleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedIds([]);
      setSelectAll(false);
    } else {
      const allIds = logs.map((log) => log._id);
      setSelectedIds(allIds);
      setSelectAll(true);
    }
  }, [selectAll, logs]);

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setModuleFilter("");
    setUserFilter("");
    goToPage(1);
  };

  const hasActiveFilters = startDate || endDate || moduleFilter || userFilter;

  /**
   * Check if MODERATOR can delete this log (only own logs)
   */
  const canDelete = useCallback(
    (log) => {
      if (isAdmin) return true;
      return (
        log.user?._id === currentUser?._id || log.user === currentUser?._id
      );
    },
    [isAdmin, currentUser],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5 pb-20"
    >
      <PageHeader
        title="Activity Logs"
        subtitle="Monitor all system activities and user actions"
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Activity Logs", active: true },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {/* Bulk Delete Button */}
            {selectedIds.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowBulkDeleteConfirm(true)}
                leftIcon={faTrashAlt}
              >
                Bulk Delete ({selectedIds.length})
              </Button>
            )}
            {/* Clear All Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearAllConfirm(true)}
              leftIcon={faTrash}
              className="!text-red-500 !border-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/20"
            >
              Clear All
            </Button>
          </div>
        }
      />

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
          isAdmin
            ? "bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300"
            : "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
        }`}
      >
        <FontAwesomeIcon
          icon={isAdmin ? faShieldHalved : faUserShield}
          className="w-4 h-4"
        />
        <span>
          {isAdmin
            ? "You are viewing all users' activity as an Administrator."
            : "You are viewing your own activity only as a Moderator."}
        </span>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-4"
      >
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Start Date */}
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-medium text-text-para-light dark:text-text-para-dark mb-1 uppercase tracking-wider">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                goToPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] text-sm text-text-heading-light dark:text-text-heading-dark focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* End Date */}
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-medium text-text-para-light dark:text-text-para-dark mb-1 uppercase tracking-wider">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                goToPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] text-sm text-text-heading-light dark:text-text-heading-dark focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* Module Filter */}
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-medium text-text-para-light dark:text-text-para-dark mb-1 uppercase tracking-wider">
              Module
            </label>
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                goToPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] text-sm text-text-heading-light dark:text-text-heading-dark focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="">All Modules</option>
              {MODULE_OPTIONS.map((mod) => (
                <option key={mod} value={mod}>
                  {mod.charAt(0).toUpperCase() + mod.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Items Per Page */}
          <div className="min-w-[100px]">
            <label className="block text-[10px] font-medium text-text-para-light dark:text-text-para-dark mb-1 uppercase tracking-wider">
              Per Page
            </label>
            <select
              value={limit}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] text-sm text-text-heading-light dark:text-text-heading-dark focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {LIMIT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" /> Clear
              </button>
            </div>
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
                className="skeleton h-12 rounded-lg"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            title="No activity logs found"
            description={
              hasActiveFilters
                ? "Try adjusting your filters"
                : "Activity will appear here as users interact with the system"
            }
            icon={faFilter}
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-gray-900/30">
                  {/* Checkbox Column */}
                  <th className="px-4 py-3 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="text-text-para-light hover:text-brand-primary transition-colors"
                    >
                      <FontAwesomeIcon
                        icon={
                          selectAll
                            ? faCheckSquare
                            : selectedIds.length > 0
                              ? faMinusSquare
                              : faSquare
                        }
                        className="w-4 h-4"
                      />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-para-light dark:text-text-para-dark uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-para-light dark:text-text-para-dark uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-para-light dark:text-text-para-dark uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-para-light dark:text-text-para-dark uppercase tracking-wider hidden lg:table-cell">
                    IP Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-para-light dark:text-text-para-dark uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-para-light dark:text-text-para-dark uppercase tracking-wider w-16">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <motion.tr
                    key={log._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`
                      border-b border-border-light dark:border-border-dark
                      hover:bg-brand-softbg/30 dark:hover:bg-brand-primary/5 transition-colors
                      ${selectedIds.includes(log._id) ? "bg-brand-softbg/20 dark:bg-brand-primary/5" : ""}
                    `}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleSelection(log._id)}
                        className="text-text-para-light hover:text-brand-primary transition-colors"
                      >
                        <FontAwesomeIcon
                          icon={
                            selectedIds.includes(log._id)
                              ? faCheckSquare
                              : faSquare
                          }
                          className="w-4 h-4"
                        />
                      </button>
                    </td>
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={log.user?.name || "Unknown"} size="sm" />
                        <span className="font-medium text-text-heading-light dark:text-text-heading-dark text-sm truncate max-w-[120px]">
                          {log.user?.name || "System"}
                        </span>
                      </div>
                    </td>
                    {/* Action */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-text-heading-light dark:text-text-heading-dark">
                        {log.action}
                      </span>
                    </td>
                    {/* Module Badge */}
                    <td className="px-4 py-3">
                      <Badge
                        variant={MODULE_COLORS[log.module] || "default"}
                        className="text-[10px] px-2"
                      >
                        {log.module}
                      </Badge>
                    </td>
                    {/* IP Address */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-text-para-light dark:text-text-para-dark font-mono">
                        {log.ipAddress || "—"}
                      </span>
                    </td>
                    {/* Timestamp */}
                    <td className="px-4 py-3">
                      <Tooltip
                        content={formatDate(
                          log.createdAt,
                          "MMM dd, yyyy hh:mm:ss a",
                        )}
                      >
                        <span className="text-xs text-text-para-light dark:text-text-para-dark cursor-help">
                          {formatRelativeTime(log.createdAt)}
                        </span>
                      </Tooltip>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      {canDelete(log) && (
                        <button
                          onClick={() => setDeleteTarget(log)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all"
                          title="Delete log"
                        >
                          <FontAwesomeIcon
                            icon={faTrash}
                            className="w-3.5 h-3.5"
                          />
                        </button>
                      )}
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
        ) : logs.length === 0 ? (
          <EmptyState
            title="No activity logs found"
            description={
              hasActiveFilters
                ? "Try adjusting your filters"
                : "Activity will appear here"
            }
          />
        ) : (
          logs.map((log) => (
            <motion.div
              key={log._id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar name={log.user?.name || "Unknown"} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-text-heading-light dark:text-text-heading-dark">
                      {log.user?.name || "System"}
                    </p>
                    <p className="text-xs text-text-para-light dark:text-text-para-dark">
                      {log.action}
                    </p>
                  </div>
                </div>
                {canDelete(log) && (
                  <button
                    onClick={() => setDeleteTarget(log)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={MODULE_COLORS[log.module] || "default"}
                  className="text-[10px]"
                >
                  {log.module}
                </Badge>
                <span className="text-[10px] text-text-para-light font-mono">
                  {log.ipAddress || "—"}
                </span>
              </div>
              <p className="text-[10px] text-text-para-light">
                {formatRelativeTime(log.createdAt)}
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

      {/* Floating Selection Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card-light dark:bg-card-dark border-t-2 border-brand-primary shadow-2xl px-4 py-3"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-softbg dark:bg-brand-primary/10 text-brand-primary rounded-lg text-sm font-medium">
                  <FontAwesomeIcon icon={faCheckSquare} className="w-4 h-4" />
                  {selectedIds.length} selected
                </span>
                <button
                  onClick={() => {
                    setSelectedIds([]);
                    setSelectAll(false);
                  }}
                  className="text-xs text-text-para-light hover:text-red-500 transition-colors"
                >
                  Deselect all
                </button>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowBulkDeleteConfirm(true)}
                leftIcon={faTrashAlt}
              >
                Delete Selected ({selectedIds.length})
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Single Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        title="Delete Log Entry"
        message="Are you sure you want to delete this activity log entry?"
        confirmText="Delete"
        variant="warning"
        loading={deleteMutation.isPending}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={() => bulkDeleteMutation.mutate(selectedIds)}
        title="Bulk Delete Logs"
        message={`Are you sure you want to delete ${selectedIds.length} selected log entries? This cannot be undone.`}
        confirmText={`Delete ${selectedIds.length} Logs`}
        variant="danger"
        loading={bulkDeleteMutation.isPending}
      />

      {/* Clear All Confirmation */}
      <ConfirmDialog
        isOpen={showClearAllConfirm}
        onClose={() => setShowClearAllConfirm(false)}
        onConfirm={() => clearAllMutation.mutate()}
        title="Clear All Activity Logs"
        message={
          isAdmin
            ? "⚠️ This will permanently delete ALL activity logs from ALL users. This cannot be undone."
            : "This will permanently delete all your activity logs. This cannot be undone."
        }
        confirmText="Clear All Logs"
        variant="danger"
        loading={clearAllMutation.isPending}
      />
    </motion.div>
  );
}

export default ActivityLogsPage;
