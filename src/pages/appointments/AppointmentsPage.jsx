/* eslint-disable no-unused-vars */
import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faEye,
  faCheck,
  faBan,
  faSearch,
  faFilter,
  faXmark,
  faSpinner,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { getAppointments, updateAppointmentStatus } from "@api/appointment.api";
import { useDebounce } from "@hooks/useDebounce";
import { usePagination } from "@hooks/usePagination";
import { formatDate } from "@utils/formatDate";
import PageHeader from "@components/shared/PageHeader";
import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import StatusBadge from "@components/shared/StatusBadge";
import DataTable from "@components/shared/DataTable";
import Pagination from "@components/ui/Pagination";
import AppointmentDetailModal from "@components/appointments/AppointmentDetailModal";
import { toast } from "sonner";

/**
 * Status tab configuration
 * @constant {Array<{label: string, value: string, color: string}>}
 */
const STATUS_TABS = [
  { label: "All", value: "", color: "bg-gray-500" },
  { label: "Pending", value: "PENDING", color: "bg-yellow-500" },
  { label: "Confirmed", value: "CONFIRMED", color: "bg-green-500" },
  { label: "Cancelled", value: "CANCELLED", color: "bg-red-500" },
];

/**
 * AppointmentsPage - Complete appointment management page
 *
 * Features:
 * - Status tabs with animated indicator and counts
 * - Search with debounce (300ms)
 * - Date range filters
 * - Responsive table (desktop) / card list (mobile)
 * - Quick status change (Confirm/Cancel)
 * - Detail modal on click
 * - Pagination with React Query
 * - Skeleton loaders on all states
 *
 * @returns {JSX.Element} Appointments management page
 */
function AppointmentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [activeTab, setActiveTab] = useState("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Hooks
  const debouncedSearch = useDebounce(search, 300);
  const { page, limit, goToPage, paginationParams } = usePagination({
    initialPage: 1,
    initialLimit: 10,
  });

  /**
   * Build query params from all filters
   */
  const queryParams = useMemo(() => {
    const params = { ...paginationParams };
    if (activeTab) params.status = activeTab;
    if (debouncedSearch) params.search = debouncedSearch;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return params;
  }, [activeTab, debouncedSearch, startDate, endDate, paginationParams]);

  /**
   * React Query: Fetch appointments
   */
  const {
    data: appointmentsData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["appointments", queryParams],
    queryFn: () => getAppointments(queryParams),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev, // Keep previous data while fetching
  });

  const appointments = useMemo(
    () => appointmentsData?.data?.docs || [],
    [appointmentsData],
  );

  const pagination = useMemo(
    () => ({
      totalDocs: appointmentsData?.data?.totalDocs || 0,
      totalPages: appointmentsData?.data?.totalPages || 1,
      currentPage: appointmentsData?.data?.page || 1,
      limit: appointmentsData?.data?.limit || 10,
      hasNextPage: appointmentsData?.data?.hasNextPage || false,
      hasPrevPage: appointmentsData?.data?.hasPrevPage || false,
    }),
    [appointmentsData],
  );
  /**
   * Fetch appointment detail and open modal
   * @param {Object} appointment - Appointment row data
   */
  const handleViewDetail = useCallback(async (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
    setIsDetailLoading(false);
    // Data is already available from the list
  }, []);

  /**
   * Quick status change from table row
   * @param {string} id - Appointment ID
   * @param {'CONFIRMED'|'CANCELLED'} status - New status
   */
  const handleQuickStatusChange = useCallback(
    async (id, status, e) => {
      e.stopPropagation(); // Prevent row click

      try {
        await updateAppointmentStatus(id, status);
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
        queryClient.invalidateQueries({ queryKey: ["appointments", "charts"] });
        toast.success(`Appointment ${status.toLowerCase()}`);
      } catch (error) {
        const message =
          error?.response?.data?.message || "Failed to update status";
        toast.error(message);
      }
    },
    [queryClient],
  );

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    setActiveTab("");
    setSearch("");
    setStartDate("");
    setEndDate("");
    goToPage(1);
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = activeTab || search || startDate || endDate;

  /**
   * Calculate status counts from the data
   */
  const statusCounts = useMemo(() => {
    const counts = { "": 0, PENDING: 0, CONFIRMED: 0, CANCELLED: 0 };
    if (appointmentsData?.data?.pagination?.totalDocs) {
      // We need total counts per status - this comes from a separate query ideally
      // For now, we'll use what we have in the current page
      appointments.forEach((app) => {
        if (counts[app.status] !== undefined) counts[app.status]++;
      });
    }
    return counts;
  }, [appointments, appointmentsData]);

  /**
   * Table columns configuration
   */
  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Patient Name",
        className: "min-w-[150px]",
        render: (row) => (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-softbg dark:bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-brand-primary">
                {row.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <span className="font-medium text-text-heading-light dark:text-text-heading-dark text-sm">
              {row.name}
            </span>
          </div>
        ),
      },
      {
        key: "phone",
        label: "Phone",
        className: "min-w-[130px]",
        render: (row) => (
          <span className="text-sm text-text-para-light dark:text-text-para-dark">
            {row.phone}
          </span>
        ),
      },
      {
        key: "email",
        label: "Email",
        className: "min-w-[180px] hidden lg:table-cell",
        render: (row) => (
          <span className="text-sm text-text-para-light dark:text-text-para-dark truncate block max-w-[180px]">
            {row.email || "—"}
          </span>
        ),
      },
      {
        key: "preferredDate",
        label: "Preferred Date",
        className: "min-w-[110px]",
        render: (row) => (
          <span className="text-sm text-text-heading-light dark:text-text-heading-dark">
            {formatDate(row.preferredDate, "MMM dd, yyyy")}
          </span>
        ),
      },
      {
        key: "preferredTime",
        label: "Time",
        className: "min-w-[80px]",
        render: (row) => (
          <span className="text-sm text-text-heading-light dark:text-text-heading-dark">
            {row.preferredTime || "—"}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        className: "min-w-[100px]",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "location",
        label: "Location",
        className: "min-w-[130px] hidden xl:table-cell",
        render: (row) => (
          <span className="text-sm text-text-para-light dark:text-text-para-dark">
            {row.location?.city || "N/A"}
            {row.location?.country ? `, ${row.location.country}` : ""}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        className: "min-w-[140px] text-right",
        render: (row) => (
          <div className="flex items-center justify-end gap-1.5">
            {/* View Detail Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetail(row);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-text-para-light dark:text-text-para-dark hover:text-brand-primary transition-all"
              aria-label={`View details for ${row.name}`}
              title="View Details"
            >
              <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
            </button>

            {/* Quick Status Actions for PENDING */}
            {row.status === "PENDING" && (
              <>
                <button
                  onClick={(e) =>
                    handleQuickStatusChange(row._id, "CONFIRMED", e)
                  }
                  className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 hover:text-green-700 transition-all"
                  aria-label={`Confirm appointment for ${row.name}`}
                  title="Confirm"
                >
                  <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) =>
                    handleQuickStatusChange(row._id, "CANCELLED", e)
                  }
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 hover:text-red-600 transition-all"
                  aria-label={`Cancel appointment for ${row.name}`}
                  title="Cancel"
                >
                  <FontAwesomeIcon icon={faBan} className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [handleViewDetail, handleQuickStatusChange],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Page Header */}
      <PageHeader
        title="Appointments"
        subtitle="Manage patient appointments and schedules"
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Appointments", active: true },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={faChartBar}
            onClick={() => navigate("/appointments/charts")}
          >
            View Charts
          </Button>
        }
      />

      {/* Status Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
            {/* Status dot */}
            <span className={`w-2 h-2 rounded-full ${tab.color}`} />
            {tab.label}
            {/* Count badge */}
            {statusCounts[tab.value] > 0 && (
              <span
                className={`
                text-xs px-1.5 py-0.5 rounded-full font-medium
                ${
                  activeTab === tab.value
                    ? "bg-brand-primary/15 text-brand-primary"
                    : "bg-gray-100 dark:bg-gray-700 text-text-para-light dark:text-text-para-dark"
                }
              `}
              >
                {statusCounts[tab.value]}
              </span>
            )}
            {/* Active indicator */}
            {activeTab === tab.value && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-primary rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-para-light dark:text-text-para-dark"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                goToPage(1);
              }}
              placeholder="Search by name or phone..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] text-text-heading-light dark:text-text-heading-dark placeholder:text-text-para-light dark:placeholder:text-text-para-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Clear search"
              >
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
              ${
                showFilters
                  ? "bg-brand-softbg dark:bg-brand-primary/10 text-brand-primary"
                  : "text-text-para-light dark:text-text-para-dark border border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-gray-800"
              }
            `}
          >
            <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />
            Filters
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        {/* Date Range Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-text-para-light dark:text-text-para-dark mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      goToPage(1);
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] text-text-heading-light dark:text-text-heading-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-text-para-light dark:text-text-para-dark mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      goToPage(1);
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] text-text-heading-light dark:text-text-heading-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Loading Indicator */}
      {isFetching && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 text-xs text-text-para-light dark:text-text-para-dark"
        >
          <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
          Refreshing...
        </motion.div>
      )}

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <DataTable
          columns={columns}
          data={appointments}
          loading={isLoading}
          emptyText="No appointments found"
          emptyDescription={
            hasActiveFilters
              ? "No appointments match your current filters. Try adjusting them."
              : "No appointments have been booked yet."
          }
          emptyAction={
            hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            ) : null
          }
          onRowClick={handleViewDetail}
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

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        loading={isDetailLoading}
      />
    </motion.div>
  );
}

export default AppointmentsPage;
