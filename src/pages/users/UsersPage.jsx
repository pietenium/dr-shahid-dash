/* eslint-disable no-unused-vars */
import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { getUsers, toggleUserActive, deleteUser } from "@api/users.api";
import { useAuth } from "@hooks/useAuth";
import { useDebounce } from "@hooks/useDebounce";
import { usePagination } from "@hooks/usePagination";
import { formatDate, formatRelativeTime } from "@utils/formatDate";
import PageHeader from "@components/shared/PageHeader";
import Button from "@components/ui/Button";
import Badge from "@components/ui/Badge";
import DataTable from "@components/shared/DataTable";
import Pagination from "@components/ui/Pagination";
import ConfirmDialog from "@components/ui/ConfirmDialog";
import InviteModeratorModal from "@components/users/InviteModeratorModal";
import EmptyState from "@components/ui/EmptyState";
import { toast } from "sonner";

/**
 * Role badge variant mapping
 */
const ROLE_VARIANTS = {
  ADMIN: "purple",
  MODERATOR: "info",
};

/**
 * Role background colors for avatars
 */
const ROLE_AVATAR_COLORS = {
  ADMIN: "bg-brand-primary",
  MODERATOR: "bg-brand-secondary",
};

/**
 * UsersPage - User management page (ADMIN only)
 *
 * Features:
 * - Route guard: redirects non-ADMIN users
 * - Search by name/email with debounce
 * - Role and active status filters
 * - Toggle active/inactive with optimistic updates
 * - Delete user with safeguards (cannot delete self, last admin)
 * - Invite moderator modal
 * - Responsive table/card layout
 */
function UsersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser, isAdmin } = useAuth();

  // ✅ MOVED: All hooks BEFORE any conditional returns
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search, 300);
  const { page, limit, goToPage, paginationParams } = usePagination({
    initialLimit: 10,
  });

  /**
   * Build query params from all filters
   */
  const queryParams = useMemo(() => {
    const params = { ...paginationParams };
    if (debouncedSearch) params.search = debouncedSearch;
    if (roleFilter) params.role = roleFilter;
    if (activeFilter === "active") params.isActive = true;
    if (activeFilter === "inactive") params.isActive = false;
    return params;
  }, [debouncedSearch, roleFilter, activeFilter, paginationParams]);

  /**
   * Fetch users
   */
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", queryParams],
    queryFn: () => getUsers(queryParams),
    staleTime: 2 * 60 * 1000,
  });

  const users = useMemo(() => usersData?.data?.results || [], [usersData]);
  const pagination = useMemo(
    () => usersData?.data?.pagination || {},
    [usersData],
  );

  /**
   * Toggle active mutation with optimistic update
   */
  const toggleMutation = useMutation({
    mutationFn: ({ id }) => toggleUserActive(id),
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["users"] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(["users", queryParams]);

      // Optimistically update
      queryClient.setQueryData(["users", queryParams], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            results: old.data.results.map((u) =>
              u._id === id ? { ...u, isActive: !u.isActive } : u,
            ),
          },
        };
      });

      return { previousData };
    },
    onError: (error, _, context) => {
      // Revert on error
      queryClient.setQueryData(["users", queryParams], context.previousData);

      const status = error?.response?.status;
      const message = error?.response?.data?.message;
      if (status === 403) {
        toast.error(message || "You cannot change this user status");
      } else {
        toast.error("Failed to update user status");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  /**
   * Delete mutation
   */
  const deleteMutation = useMutation({
    mutationFn: ({ id }) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
      setDeleteTarget(null);
    },
    onError: (error) => {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;
      if (status === 403) {
        toast.error(message || "Cannot delete this user");
      } else if (status === 404) {
        toast.error("User not found. List refreshed.");
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        toast.error("Failed to delete user");
      }
      setDeleteTarget(null);
    },
  });

  /**
   * Check if user is the current logged-in user
   */
  const isSelf = useCallback(
    (userId) => currentUser?._id === userId,
    [currentUser],
  );

  /**
   * Check if user is the last admin (cannot be deleted)
   */
  const isLastAdmin = useCallback(
    (targetUser) => {
      if (targetUser.role !== "ADMIN") return false;
      const adminCount = users.filter((u) => u.role === "ADMIN").length;
      return adminCount <= 1;
    },
    [users],
  );

  const hasActiveFilters = roleFilter || activeFilter || search;

  /**
   * Table columns configuration
   */
  const columns = useMemo(
    () => [
      {
        key: "user",
        label: "User",
        className: "min-w-[200px]",
        render: (row) => (
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-full ${ROLE_AVATAR_COLORS[row.role] || "bg-gray-400"} flex items-center justify-center flex-shrink-0`}
            >
              <span className="text-xs font-bold text-white">
                {row.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-heading-light dark:text-text-heading-dark truncate">
                {row.name}
              </p>
              <p className="text-xs text-text-para-light dark:text-text-para-dark truncate">
                {row.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "role",
        label: "Role",
        className: "min-w-[100px]",
        render: (row) => (
          <Badge variant={ROLE_VARIANTS[row.role] || "default"} dot>
            {row.role}
          </Badge>
        ),
      },
      {
        key: "status",
        label: "Status",
        className: "min-w-[90px]",
        render: (row) => (
          <Badge variant={row.isActive ? "success" : "danger"} dot>
            {row.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        key: "lastLogin",
        label: "Last Login",
        className: "min-w-[130px] hidden lg:table-cell",
        render: (row) => (
          <span className="text-sm text-text-para-light dark:text-text-para-dark">
            {row.lastLogin ? formatRelativeTime(row.lastLogin) : "Never"}
          </span>
        ),
      },
      {
        key: "createdAt",
        label: "Created",
        className: "min-w-[110px] hidden xl:table-cell",
        render: (row) => (
          <span className="text-sm text-text-para-light dark:text-text-para-dark">
            {formatDate(row.createdAt, "MMM dd, yyyy")}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        className: "min-w-[120px] text-right",
        render: (row) => {
          const self = isSelf(row._id);
          const lastAdmin = isLastAdmin(row);
          const isTargetAdmin = row.role === "ADMIN";

          return (
            <div className="flex items-center justify-end gap-2">
                          {/* Toggle Active Switch */}
            <button
              onClick={() => {
                if (self || isTargetAdmin) return;
                toggleMutation.mutate({ id: row._id });
              }}
              disabled={self || isTargetAdmin || toggleMutation.isPending}
              title={
                self
                  ? "Cannot toggle yourself"
                  : isTargetAdmin
                    ? "Cannot toggle admin"
                    : row.isActive
                      ? "Deactivate user"
                      : "Activate user"
              }
              className={`
                relative w-11 h-6 rounded-full transition-colors duration-300
                ${self || isTargetAdmin ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                ${row.isActive ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}
              `}
            >
              <motion.div
                animate={{ x: row.isActive ? 20 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow"
              />
            </button>
              {/* Delete Button */}
              <button
                onClick={() => setDeleteTarget(row)}
                disabled={self || lastAdmin}
                title={
                  self
                    ? "Cannot delete yourself"
                    : lastAdmin
                      ? "Cannot delete last administrator"
                      : "Delete user"
                }
                className={`
                p-2 rounded-lg transition-colors
                ${
                  self || lastAdmin
                    ? "opacity-30 cursor-not-allowed text-gray-400"
                    : "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                }
              `}
              >
                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [isSelf, isLastAdmin, toggleMutation],
  );

  // ✅ MOVED: Route guard AFTER all hooks
  if (!isAdmin) {
    toast.error("Access denied. Admin privileges required.");
    navigate("/dashboard", { replace: true });
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <PageHeader
        title="User Management"
        subtitle="Manage administrators and moderators"
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Users", active: true },
        ]}
        actions={
          <Button
            variant="primary"
            leftIcon={faPlus}
            onClick={() => setInviteModalOpen(true)}
          >
            Invite Moderator
          </Button>
        }
      />

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
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
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              goToPage(1);
            }}
            className="px-3 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admins</option>
            <option value="MODERATOR">Moderators</option>
          </select>

          {/* Active Filter */}
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              goToPage(1);
            }}
            className="px-3 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("");
                setActiveFilter("");
                goToPage(1);
              }}
              className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DataTable
          columns={columns}
          data={users}
          loading={isLoading}
          emptyText="No users found"
          emptyDescription={
            hasActiveFilters
              ? "Try adjusting your filters"
              : "No users in the system"
          }
        />
      </motion.div>

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

      {/* Invite Moderator Modal */}
      <InviteModeratorModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate({ id: deleteTarget?._id })}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </motion.div>
  );
}

export default UsersPage;
