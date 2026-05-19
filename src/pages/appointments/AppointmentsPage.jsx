/* eslint-disable no-unused-vars */
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faEye,
  faCheck,
  faBan,
  faTrash,
  faSearch,
  faFilter,
  faXmark,
  faSpinner,
  faChevronDown,
  faPrint,
  faCheckSquare,
  faSquare,
  faMinusSquare,
  faTrashAlt,
  faHospital,
} from "@fortawesome/free-solid-svg-icons";
import {
  getAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  bulkDeleteAppointments,
} from "@api/appointment.api";
import { getChambers } from "@api/chamber.api";
import { useDebounce } from "@hooks/useDebounce";
import { usePagination } from "@hooks/usePagination";
import { formatDate } from "@utils/formatDate";
import PageHeader from "@components/shared/PageHeader";
import Button from "@components/ui/Button";
import StatusBadge from "@components/shared/StatusBadge";
import DataTable from "@components/shared/DataTable";
import Pagination from "@components/ui/Pagination";
import ConfirmDialog from "@components/ui/ConfirmDialog";
import AppointmentDetailModal from "@components/appointments/AppointmentDetailModal";
import { toast } from "sonner";
import { useNotifications } from "@context/NotificationContext";
import { joinRoom, leaveRoom } from "@lib/socket";

const STATUS_TABS = [
  { label: "All", value: "", color: "bg-gray-500" },
  { label: "Pending", value: "PENDING", color: "bg-yellow-500" },
  { label: "Confirmed", value: "CONFIRMED", color: "bg-green-500" },
  { label: "Cancelled", value: "CANCELLED", color: "bg-red-500" },
];

function AppointmentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ── Filters ──
  const [activeTab, setActiveTab] = useState("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chamberFilter, setChamberFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // ── Selection ──
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // ── Modals ──
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState(null); // { type: 'selected'|'status', ids?: [], status?: string, label: string }
  const [printTarget, setPrintTarget] = useState(null); // null | 'all' | appointmentObject
  const printRef = useRef(null);

  const debouncedSearch = useDebounce(search, 300);
  const { page, limit, goToPage, paginationParams } = usePagination({
    initialPage: 1,
    initialLimit: 10,
  });

  /**
   * Build query params
   */
  const queryParams = useMemo(() => {
    const params = { ...paginationParams };
    if (activeTab) params.status = activeTab;
    if (debouncedSearch) params.search = debouncedSearch;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (chamberFilter) params.chemberId = chamberFilter;
    return params;
  }, [
    activeTab,
    debouncedSearch,
    startDate,
    endDate,
    chamberFilter,
    paginationParams,
  ]);

  /**
   * Fetch appointments
   */
  const {
    data: appointmentsData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["appointments", queryParams],
    queryFn: () => getAppointments(queryParams),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  /**
   * Fetch chambers for filter dropdown
   */
  const { data: chambersData } = useQuery({
    queryKey: ["chambers"],
    queryFn: getChambers,
    staleTime: 10 * 60 * 1000,
  });

  const appointments = useMemo(
    () => appointmentsData?.data?.docs || [],
    [appointmentsData],
  );
  const chambers = useMemo(() => chambersData?.data || [], [chambersData]);
  const pagination = useMemo(
    () => ({
      totalDocs: appointmentsData?.data?.totalDocs || 0,
      totalPages: appointmentsData?.data?.totalPages || 1,
      currentPage: appointmentsData?.data?.page || 1,
      limit: appointmentsData?.data?.limit || 10,
    }),
    [appointmentsData],
  );

  // ── Mutations ──
  const deleteMutation = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", "charts"] });
      toast.success("Appointment deleted");
      setDeleteTarget(null);
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to delete"),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteAppointments,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments", "charts"] });
      toast.success(`${data.data?.deletedCount || 0} appointments deleted`);
      setSelectedIds([]);
      setSelectAll(false);
      setBulkDeleteTarget(null);
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to delete"),
  });

  // ── Handlers ──
  const handleViewDetail = useCallback((appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  }, []);

  const handleQuickStatusChange = useCallback(
    async (id, status, e) => {
      e.stopPropagation();
      try {
        await updateAppointmentStatus(id, status);
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
        queryClient.invalidateQueries({ queryKey: ["appointments", "charts"] });
        toast.success(`Appointment ${status.toLowerCase()}`);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to update status",
        );
      }
    },
    [queryClient],
  );

  const handleClearFilters = () => {
    setActiveTab("");
    setSearch("");
    setStartDate("");
    setEndDate("");
    setChamberFilter("");
    goToPage(1);
  };

  const hasActiveFilters =
    activeTab || search || startDate || endDate || chamberFilter;

  // ── Selection Logic ──
  const toggleSelection = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedIds([]);
      setSelectAll(false);
    } else {
      setSelectedIds(appointments.map((a) => a._id));
      setSelectAll(true);
    }
  }, [selectAll, appointments]);

  // ── Bulk Delete ──
  const handleBulkDeleteSelected = () => {
    setBulkDeleteTarget({
      type: "selected",
      ids: selectedIds,
      label: `${selectedIds.length} selected appointments`,
    });
  };

  const handleBulkDeleteByStatus = (status) => {
    setBulkDeleteTarget({
      type: "status",
      status,
      label: `all ${status.toLowerCase()} appointments`,
    });
  };

  const confirmBulkDelete = () => {
    if (!bulkDeleteTarget) return;
    const payload =
      bulkDeleteTarget.type === "selected"
        ? { ids: bulkDeleteTarget.ids }
        : { status: bulkDeleteTarget.status };
    bulkDeleteMutation.mutate(payload);
  };

  // ── Print ──
  const handlePrint = () => {
    window.print();
  };

  // ── Socket.IO ──
  const { resetAppointmentUnread } = useNotifications();
  useEffect(() => {
    joinRoom("appointments");
    resetAppointmentUnread();
    return () => leaveRoom("appointments");
  }, [resetAppointmentUnread]);

  // ── Status Counts ──
  const statusCounts = useMemo(() => {
    const counts = { "": 0, PENDING: 0, CONFIRMED: 0, CANCELLED: 0 };
    appointments.forEach((app) => {
      if (counts[app.status] !== undefined) counts[app.status]++;
    });
    return counts;
  }, [appointments]);

  /**
   * Trigger browser print when printTarget is set, then reset
   */
  useEffect(() => {
    if (printTarget) {
      const timer = setTimeout(() => {
        window.print();
        setPrintTarget(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [printTarget]);

  // ── Table Columns ──
  const columns = useMemo(
    () => [
      {
        key: "checkbox",
        label: (
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
        ),
        className: "w-10",
        render: (row) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSelection(row._id);
            }}
            className="text-text-para-light hover:text-brand-primary transition-colors"
          >
            <FontAwesomeIcon
              icon={selectedIds.includes(row._id) ? faCheckSquare : faSquare}
              className="w-4 h-4"
            />
          </button>
        ),
      },
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
          <span className="text-sm text-text-para-light">{row.phone}</span>
        ),
      },
      {
        key: "chamber",
        label: "Chamber",
        className: "min-w-[140px] hidden lg:table-cell",
        render: (row) => (
          <span className="text-sm text-text-heading-light dark:text-text-heading-dark truncate block max-w-[140px]">
            {row.chemberId?.chemberName || "—"}
          </span>
        ),
      },
      {
        key: "preferredDate",
        label: "Date",
        className: "min-w-[110px]",
        render: (row) => (
          <span className="text-sm">
            {formatDate(row.preferredDate, "MMM dd, yyyy")}
          </span>
        ),
      },
      {
        key: "preferredTime",
        label: "Time",
        className: "min-w-[80px]",
        render: (row) => (
          <span className="text-sm">{row.preferredTime || "—"}</span>
        ),
      },
      {
        key: "status",
        label: "Status",
        className: "min-w-[100px]",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "actions",
        label: "Actions",
        className: "min-w-[160px] text-right",
        render: (row) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetail(row);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-text-para-light hover:text-brand-primary transition-all"
              title="View"
            >
              <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
            </button>
            {row.status === "PENDING" && (
              <>
                <button
                  onClick={(e) =>
                    handleQuickStatusChange(row._id, "CONFIRMED", e)
                  }
                  className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600"
                  title="Confirm"
                >
                  <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) =>
                    handleQuickStatusChange(row._id, "CANCELLED", e)
                  }
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                  title="Cancel"
                >
                  <FontAwesomeIcon icon={faBan} className="w-4 h-4" />
                </button>
              </>
            )}
            {activeTab === "CONFIRMED" && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={faPrint}
                onClick={() => setPrintTarget("all")}
              >
                Print All
              </Button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(row);
              }}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all"
              title="Delete"
            >
              <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [
      selectAll,
      selectedIds,
      handleViewDetail,
      handleQuickStatusChange,
      toggleSelection,
      toggleSelectAll,
      activeTab,
    ],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5 pb-20"
    >
      <PageHeader
        title="Appointments"
        subtitle="Manage patient appointments and schedules"
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Appointments", active: true },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {activeTab === "CONFIRMED" && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={faPrint}
                onClick={() => setPrintTarget("all")}
              >
                Print All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              leftIcon={faChartBar}
              onClick={() => navigate("/appointments/charts")}
            >
              View Charts
            </Button>
          </div>
        }
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
              setSelectedIds([]);
              setSelectAll(false);
            }}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeTab === tab.value ? "text-brand-primary bg-brand-softbg dark:bg-brand-primary/10" : "text-text-para-light dark:text-text-para-dark hover:bg-gray-100 dark:hover:bg-gray-800"}`}
          >
            <span className={`w-2 h-2 rounded-full ${tab.color}`} />
            {tab.label}
            {statusCounts[tab.value] > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${activeTab === tab.value ? "bg-brand-primary/15 text-brand-primary" : "bg-gray-100 dark:bg-gray-700"}`}
              >
                {statusCounts[tab.value]}
              </span>
            )}
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
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-4"
      >
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="flex-1 relative min-w-[180px]">
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
              placeholder="Search by name or phone..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* Chamber Filter */}
          <select
            value={chamberFilter}
            onChange={(e) => {
              setChamberFilter(e.target.value);
              goToPage(1);
            }}
            className="px-3 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary min-w-[160px]"
          >
            <option value="">
              <FontAwesomeIcon icon={faHospital} /> All Chambers
            </option>
            {chambers.map((ch) => (
              <option key={ch._id} value={ch._id}>
                {ch.chemberName}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${showFilters ? "bg-brand-softbg dark:bg-brand-primary/10 text-brand-primary" : "text-text-para-light dark:text-text-para-dark border border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-gray-800"}`}
          >
            <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />
            Filters
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </button>

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

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-text-para-light mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      goToPage(1);
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-text-para-light mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      goToPage(1);
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-[#0f172a] focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-2 bg-brand-softbg dark:bg-brand-primary/10 rounded-xl border border-brand-primary/20"
        >
          <span className="text-sm font-medium text-brand-primary">
            {selectedIds.length} selected
          </span>
          <button
            onClick={() => {
              setSelectedIds([]);
              setSelectAll(false);
            }}
            className="text-xs text-text-para-light hover:text-red-500"
          >
            Deselect
          </button>
          <div className="flex-1" />
          <Button
            variant="danger"
            size="sm"
            leftIcon={faTrashAlt}
            onClick={handleBulkDeleteSelected}
          >
            Delete Selected
          </Button>
        </motion.div>
      )}

      {/* Delete by Status Buttons */}
      {(activeTab === "CANCELLED" || activeTab === "CONFIRMED") &&
        appointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-end"
          >
            <Button
              variant="outline"
              size="sm"
              leftIcon={faTrashAlt}
              onClick={() => handleBulkDeleteByStatus(activeTab)}
              className="!text-red-500 !border-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/20"
            >
              Delete All{" "}
              {activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}
            </Button>
          </motion.div>
        )}

      {/* Loading */}
      {isFetching && !isLoading && (
        <div className="flex items-center justify-center gap-2 text-xs text-text-para-light">
          <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
          Refreshing...
        </div>
      )}

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DataTable
          columns={columns}
          data={appointments}
          loading={isLoading}
          emptyText="No appointments found"
          emptyDescription={
            hasActiveFilters
              ? "No appointments match your current filters."
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

      {/* Detail Modal */}
      <AppointmentDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
      />

      {/* Single Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        title="Delete Appointment"
        message={`Delete appointment from "${deleteTarget?.name}"?`}
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />

      {/* Bulk Delete Confirm */}
      <ConfirmDialog
        isOpen={!!bulkDeleteTarget}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={confirmBulkDelete}
        title="Bulk Delete Appointments"
        message={`Are you sure you want to delete ${bulkDeleteTarget?.label}? This cannot be undone.`}
        confirmText={`Delete ${bulkDeleteTarget?.type === "selected" ? bulkDeleteTarget?.ids?.length : "All"}`}
        variant="danger"
        loading={bulkDeleteMutation.isPending}
      />

      {/* ========== PRINT TRIGGER & STYLES ========== */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 30px; }
          .print-area table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          .print-area th, .print-area td { border: 1px solid #d1d5db; padding: 10px 12px; text-align: left; font-size: 13px; }
          .print-area th { background-color: #f3f4f6; font-weight: 700; color: #1f2937; }
          .print-area td { color: #374151; }
          .print-header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #2FA084; }
          .print-header h2 { font-size: 20px; font-weight: 700; color: #1f2937; margin-bottom: 4px; }
          .print-header p { font-size: 13px; color: #6b7280; margin: 2px 0; }
          .single-detail { margin-bottom: 16px; }
          .single-detail .detail-row { display: flex; gap: 32px; margin-bottom: 8px; }
          .single-detail .detail-label { font-weight: 600; color: #374151; min-width: 100px; }
          .single-detail .detail-value { color: #6b7280; }
          .print-footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Single Appointment Print */}
      {printTarget && printTarget !== "all" && (
        <div className="print-area hidden">
          <div className="print-header">
            <h2>Dr. Md. Sahidur Rahman Khan</h2>
            <p>Orthopedic Surgeon</p>
            <p>Appointment Confirmation</p>
            <p>
              Printed on{" "}
              {formatDate(
                new Date().toISOString(),
                "MMMM dd, yyyy 'at' hh:mm a",
              )}
            </p>
          </div>

          <div className="single-detail">
            <div className="detail-row">
              <span className="detail-label">Patient Name:</span>
              <span className="detail-value">{printTarget.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{printTarget.phone}</span>
            </div>
            {printTarget.email && (
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{printTarget.email}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Date:</span>
              <span className="detail-value">
                {formatDate(printTarget.preferredDate, "EEEE, MMMM dd, yyyy")}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Time:</span>
              <span className="detail-value">{printTarget.preferredTime}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Chamber:</span>
              <span className="detail-value">
                {printTarget.chemberId?.chemberName || "—"}
              </span>
            </div>
            {printTarget.message && (
              <div className="detail-row">
                <span className="detail-label">Message:</span>
                <span className="detail-value">{printTarget.message}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className="detail-value font-semibold text-green-600">
                ✅ CONFIRMED
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Appointment ID:</span>
              <span className="detail-value font-mono text-xs">
                {printTarget._id}
              </span>
            </div>
          </div>

          <div className="print-footer">
            <p>
              This is a computer-generated confirmation. For any changes, please
              contact the clinic.
            </p>
            <p>
              © {new Date().getFullYear()} Dr. Md. Sahidur Rahman Khan. All
              rights reserved.
            </p>
          </div>
        </div>
      )}

      {/* Multiple Appointments Print (All Confirmed) */}
      {printTarget === "all" && (
        <div className="print-area hidden">
          <div className="print-header">
            <h2>Dr. Md. Sahidur Rahman Khan</h2>
            <p>Orthopedic Surgeon</p>
            <p>Confirmed Appointments List</p>
            <p>
              Printed on{" "}
              {formatDate(
                new Date().toISOString(),
                "MMMM dd, yyyy 'at' hh:mm a",
              )}
            </p>
            <p>
              Total:{" "}
              {appointments.filter((a) => a.status === "CONFIRMED").length}{" "}
              confirmed appointment(s)
            </p>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Patient Name</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Time</th>
                <th>Chamber</th>
              </tr>
            </thead>
            <tbody>
              {appointments
                .filter((a) => a.status === "CONFIRMED")
                .map((a, i) => (
                  <tr key={a._id}>
                    <td>{i + 1}</td>
                    <td>{a.name}</td>
                    <td>{a.phone}</td>
                    <td>{formatDate(a.preferredDate, "MMM dd, yyyy")}</td>
                    <td>{a.preferredTime}</td>
                    <td>{a.chemberId?.chemberName || "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          <div className="print-footer">
            <p>
              This is a computer-generated list. For any changes, please contact
              the clinic.
            </p>
            <p>
              © {new Date().getFullYear()} Dr. Md. Sahidur Rahman Khan. All
              rights reserved.
            </p>
          </div>
        </div>
      )}

      {/* Print Trigger Effect */}
      {printTarget && (
        <script>{`setTimeout(() => { window.print(); }, 200);`}</script>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          .print-area table { width: 100%; border-collapse: collapse; }
          .print-area th, .print-area td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          .print-area th { background-color: #f3f4f6; font-weight: 600; }
          .print-header { text-align: center; margin-bottom: 20px; }
          .print-header h2 { font-size: 18px; margin-bottom: 4px; }
          .print-header p { font-size: 12px; color: #666; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Hidden Print Area */}
      <div className="print-area hidden" ref={printRef}>
        <div className="print-header">
          <h2>Dr. Md. Sahidur Rahman Khan</h2>
          <p>Orthopedic Surgeon</p>
          <p>
            Confirmed Appointments — Printed on{" "}
            {formatDate(new Date().toISOString(), "MMMM dd, yyyy")}
          </p>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Patient Name</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Time</th>
              <th>Chamber</th>
            </tr>
          </thead>
          <tbody>
            {appointments
              .filter((a) => a.status === "CONFIRMED")
              .map((a, i) => (
                <tr key={a._id}>
                  <td>{i + 1}</td>
                  <td>{a.name}</td>
                  <td>{a.phone}</td>
                  <td>{formatDate(a.preferredDate, "MMM dd, yyyy")}</td>
                  <td>{a.preferredTime}</td>
                  <td>{a.chemberId?.chemberName || "—"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default AppointmentsPage;
