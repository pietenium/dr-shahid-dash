/* eslint-disable no-unused-vars */
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faClock,
  faArrowLeft,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import { getAppointmentCharts } from "@api/appointment.api";
import PageHeader from "@components/shared/PageHeader";
import Button from "@components/ui/Button";
import StatsCard from "@components/dashboard/StatsCard";
import AreaChartCard from "@components/charts/AreaChartCard";
import BarChartCard from "@components/charts/BarChartCard";
import PieChartCard from "@components/charts/PieChartCard";

/**
 * AppointmentChartsPage - Analytics page for appointment data
 *
 * Features:
 * - 3 KPI stat cards (Total, This Month, Pending)
 * - Daily appointments area chart (30 days)
 * - Monthly appointments bar chart (12 months)
 * - Status distribution pie chart
 * - Skeleton loaders on all sections
 *
 * @returns {JSX.Element} Appointment analytics page
 */
function AppointmentChartsPage() {
  const navigate = useNavigate();

  /**
   * React Query: Fetch chart data
   */
  const { data, isLoading } = useQuery({
    queryKey: ["appointments", "charts"],
    queryFn: getAppointmentCharts,
    staleTime: 5 * 60 * 1000,
  });

  const chartData = data?.data || {};

  /**
   * Calculate this month's appointment count
   */
  const thisMonthCount = useMemo(() => {
    const monthlyCounts = chartData.monthlyCounts || [];
    const today = new Date();
    const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const monthData = monthlyCounts.find((m) => m._id === thisMonth);
    return monthData?.count || 0;
  }, [chartData.monthlyCounts]);

  /**
   * Pending appointments count
   */
  const pendingCount = useMemo(() => {
    const statusDist = chartData.statusDistribution || [];
    const pending = statusDist.find((s) => s._id === "PENDING");
    return pending?.count || 0;
  }, [chartData.statusDistribution]);

  /**
   * Format daily chart data
   */
  const dailyChartData = useMemo(
    () =>
      (chartData.dailyCounts || []).map((item) => ({
        date: item._id,
        count: item.count,
      })),
    [chartData.dailyCounts],
  );

  /**
   * Format monthly chart data
   */
  const monthlyChartData = useMemo(
    () =>
      (chartData.monthlyCounts || []).map((item) => ({
        month: item._id,
        count: item.count,
      })),
    [chartData.monthlyCounts],
  );

  /**
   * Format pie chart data
   */
  const pieChartData = useMemo(
    () =>
      (chartData.statusDistribution || []).map((item) => ({
        name: item._id,
        value: item.count,
      })),
    [chartData.statusDistribution],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <PageHeader
        title="Appointment Analytics"
        subtitle="Visualize appointment trends and distribution"
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Appointments", path: "/appointments" },
          { label: "Charts", active: true },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={faArrowLeft}
            onClick={() => navigate("/appointments")}
          >
            Back to Appointments
          </Button>
        }
      />

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total All Time"
          value={chartData.totalCount || 0}
          icon={faChartBar}
          iconBgColor="bg-brand-softbg dark:bg-brand-primary/10"
          iconColor="text-brand-primary"
          loading={isLoading}
          delay={0}
        />
        <StatsCard
          title="This Month"
          value={thisMonthCount}
          icon={faCalendar}
          iconBgColor="bg-blue-50 dark:bg-blue-900/10"
          iconColor="text-brand-secondary"
          loading={isLoading}
          delay={1}
        />
        <StatsCard
          title="Pending"
          value={pendingCount}
          icon={faClock}
          iconBgColor="bg-yellow-50 dark:bg-yellow-900/10"
          iconColor="text-yellow-500"
          loading={isLoading}
          delay={2}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Appointments Area Chart */}
        <AreaChartCard
          title="Daily Appointments"
          subtitle="Last 30 days"
          data={dailyChartData}
          xKey="date"
          dataKey="count"
          color="#2FA084"
          height={320}
          loading={isLoading}
        />

        {/* Monthly Appointments Bar Chart */}
        <BarChartCard
          title="Monthly Appointments"
          subtitle="Last 12 months"
          data={monthlyChartData}
          xKey="month"
          dataKey="count"
          color="#578FCA"
          height={320}
          loading={isLoading}
        />
      </div>

      {/* Status Distribution Pie Chart */}
      <div className="max-w-lg mx-auto">
        <PieChartCard
          title="Status Distribution"
          subtitle="Pending vs Confirmed vs Cancelled"
          data={pieChartData}
          colors={["#EAB308", "#22C55E", "#EF4444"]}
          height={350}
          donut={true}
          loading={isLoading}
        />
      </div>

      {/* Empty State - if no data at all */}
      {!isLoading &&
        !chartData.totalCount &&
        dailyChartData.length === 0 &&
        monthlyChartData.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-full bg-brand-softbg dark:bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon
                icon={faChartBar}
                className="w-8 h-8 text-brand-primary"
              />
            </div>
            <h3 className="text-lg font-medium text-text-heading-light dark:text-text-heading-dark mb-1">
              No Chart Data Yet
            </h3>
            <p className="text-sm text-text-para-light dark:text-text-para-dark">
              Appointment data will appear here once appointments are booked.
            </p>
          </motion.div>
        )}
    </motion.div>
  );
}

export default AppointmentChartsPage;
