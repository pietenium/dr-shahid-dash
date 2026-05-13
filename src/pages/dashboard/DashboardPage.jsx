/* eslint-disable no-unused-vars */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format, formatDate } from "date-fns";
import {
  faCalendar,
  faClock,
  faEye,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@hooks/useAuth";
import { getGeoStats, getPageStats } from "@api/analytics.api";
import { getAppointments, getAppointmentCharts } from "@api/appointment.api";
import {
  getFeaturedArticles,
  getTopArticlesByCategory,
} from "@api/article.api";
import { getActivityLogs } from "@api/activityLog.api";
import PageHeader from "@components/shared/PageHeader";
import Spinner from "@components/ui/Spinner";
import StatsCard from "@components/dashboard/StatsCard";
import BarChartCard from "@components/charts/BarChartCard";
import GeoAnalyticsCard from "@components/dashboard/GeoAnalyticsCard";
import RecentAppointments from "@components/dashboard/RecentAppointments";
import FeaturedArticlesList from "@components/dashboard/FeaturedArticlesList";
import ActivityTimeline from "@components/dashboard/ActivityTimeline";
import { toast } from "sonner";

/**
 * DashboardPage - Main overview page for the admin dashboard
 *
 * Sections (top to bottom):
 * [A] Page Header with welcome message and date
 * [B] 4 KPI Stats Cards (appointments, pending, page views, visitors)
 * [C] Charts Row - Appointments bar chart + Page views horizontal bar
 * [D] Geo Analytics - Country list + pie chart
 * [E] Appointments + Featured Articles 2-col grid
 * [F] Top Articles by Category with tabs
 * [G] Recent Activity Timeline
 *
 * All data fetched in parallel via React Query
 * Every section has skeleton loader while loading
 *
 * @returns {JSX.Element} Dashboard overview page
 */
function DashboardPage() {
  const { user } = useAuth();
  const today = format(new Date(), "EEEE, MMMM dd, yyyy");

  // ========================
  // Parallel Data Fetching
  // ========================
  const geoQuery = useQuery({
    queryKey: ["analytics", "geo"],
    queryFn: getGeoStats,
    staleTime: 5 * 60 * 1000,
  });

  const pageStatsQuery = useQuery({
    queryKey: ["analytics", "pages"],
    queryFn: getPageStats,
    staleTime: 5 * 60 * 1000,
  });

  const recentAppointmentsQuery = useQuery({
    queryKey: ["appointments", "recent"],
    queryFn: () => getAppointments({ limit: 5 }),
    staleTime: 2 * 60 * 1000,
  });

  const appointmentChartsQuery = useQuery({
    queryKey: ["appointments", "charts"],
    queryFn: getAppointmentCharts,
    staleTime: 5 * 60 * 1000,
  });

  const featuredArticlesQuery = useQuery({
    queryKey: ["articles", "featured"],
    queryFn: () => getFeaturedArticles({ limit: 5 }),
    staleTime: 5 * 60 * 1000,
  });

  const topByCategoryQuery = useQuery({
    queryKey: ["articles", "top-by-category"],
    queryFn: () => getTopArticlesByCategory({ limit: 3 }),
    staleTime: 10 * 60 * 1000,
  });

  const activityLogsQuery = useQuery({
    queryKey: ["activity-logs", "recent"],
    queryFn: () => getActivityLogs({ limit: 10 }),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 30 * 1000, // Auto-refresh every 30s
  });

  // Loading state
  const isLoading =
    geoQuery.isLoading ||
    pageStatsQuery.isLoading ||
    recentAppointmentsQuery.isLoading ||
    appointmentChartsQuery.isLoading ||
    featuredArticlesQuery.isLoading ||
    topByCategoryQuery.isLoading ||
    activityLogsQuery.isLoading;

  // Error handling
  const queries = [
    { name: "Geo stats", query: geoQuery },
    { name: "Page stats", query: pageStatsQuery },
    { name: "Appointments", query: recentAppointmentsQuery },
    { name: "Charts", query: appointmentChartsQuery },
    { name: "Featured articles", query: featuredArticlesQuery },
    { name: "Top articles", query: topByCategoryQuery },
    { name: "Activity logs", query: activityLogsQuery },
  ];

  queries.forEach(({ name, query }) => {
    if (query.isError && !query.isLoading) {
      console.error(`Error fetching ${name}:`, query.error);
    }
  });

  // ========================
  // Computed Data
  // ========================
  const geoData = useMemo(() => {
    if (!geoQuery.data?.data) return [];
    return geoQuery.data.data.map((item) => ({
      country: item._id,
      count: item.count,
    }));
  }, [geoQuery.data]);
  const pageData = useMemo(
    () => pageStatsQuery.data?.data || [],
    [pageStatsQuery.data],
  );
  const recentAppointments = useMemo(
    () => recentAppointmentsQuery.data?.data?.results || [],
    [recentAppointmentsQuery.data],
  );
  const chartData = useMemo(
    () => appointmentChartsQuery.data?.data || {},
    [appointmentChartsQuery.data],
  );
  const featuredArticles = useMemo(
    () => featuredArticlesQuery.data?.data || [],
    [featuredArticlesQuery.data],
  );
  const topCategories = useMemo(
    () => topByCategoryQuery.data?.data?.categories || [],
    [topByCategoryQuery.data],
  );
  const activityLogs = useMemo(
    () => activityLogsQuery.data?.data?.results || [],
    [activityLogsQuery.data],
  );

  // Stats calculations
  const totalAppointments = chartData.totalCount || 0;
  const pendingAppointments =
    chartData.statusDistribution?.find((s) => s._id === "PENDING")?.count || 0;
  const totalPageViews = useMemo(
    () => pageData.reduce((sum, item) => sum + item.count, 0),
    [pageData],
  );
  const activeVisitors = useMemo(
    () => geoData.reduce((sum, item) => sum + item.count, 0),
    [geoData],
  );

  // Chart data formatting
  const dailyChartData = useMemo(
    () =>
      (chartData.dailyCounts || []).map((item) => ({
        date: item._id,
        count: item.count,
      })),
    [chartData.dailyCounts],
  );

  const pageViewsChartData = useMemo(
    () =>
      pageData.slice(0, 8).map((item) => ({
        page: item._id || item.page,
        visits: item.count,
      })),
    [pageData],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* ========================================== */}
      {/* [A] PAGE HEADER */}
      {/* ========================================== */}
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name?.split(" ")[0] || "Doctor"}`}
        breadcrumb={[{ label: "Dashboard", active: true }]}
        actions={
          <span className="text-xs text-text-para-light dark:text-text-para-dark bg-card-light dark:bg-card-dark px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark">
            {today}
          </span>
        }
      />

      {/* ========================================== */}
      {/* [B] STATS ROW - 4 KPI Cards */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Appointments"
          value={totalAppointments}
          icon={faCalendar}
          iconBgColor="bg-brand-softbg dark:bg-brand-primary/10"
          iconColor="text-brand-primary"
          trend="+12%"
          trendUp={true}
          loading={isLoading}
          delay={0}
        />
        <StatsCard
          title="Pending Appointments"
          value={pendingAppointments}
          icon={faClock}
          iconBgColor="bg-yellow-50 dark:bg-yellow-900/10"
          iconColor="text-yellow-500"
          trend="Needs attention"
          trendUp={false}
          loading={isLoading}
          delay={1}
        />
        <StatsCard
          title="Total Page Views"
          value={totalPageViews}
          icon={faEye}
          iconBgColor="bg-blue-50 dark:bg-blue-900/10"
          iconColor="text-brand-secondary"
          trend="+8%"
          trendUp={true}
          loading={isLoading}
          delay={2}
        />
        <StatsCard
          title="Active Visitors"
          value={activeVisitors}
          icon={faUsers}
          iconBgColor="bg-purple-50 dark:bg-purple-900/10"
          iconColor="text-purple-500"
          trend="Unique"
          trendUp={true}
          loading={isLoading}
          delay={3}
        />
      </div>

      {/* ========================================== */}
      {/* [C] CHARTS ROW */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Bar Chart */}
        <BarChartCard
          title="Daily Appointments"
          subtitle="Last 30 days"
          data={dailyChartData}
          xKey="date"
          dataKey="count"
          color="#2FA084"
          height={300}
          loading={isLoading}
        />

        {/* Page Views Horizontal Bar Chart */}
        <BarChartCard
          title="Top Pages by Views"
          subtitle="Most visited pages"
          data={pageViewsChartData}
          xKey="page"
          dataKey="visits"
          color="#578FCA"
          height={300}
          horizontal={true}
          loading={isLoading}
        />
      </div>

      {/* ========================================== */}
      {/* [D] GEO ANALYTICS */}
      {/* ========================================== */}
      <GeoAnalyticsCard geoData={geoData} loading={isLoading} />

      {/* ========================================== */}
      {/* [E] APPOINTMENTS + FEATURED ARTICLES */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAppointments
          appointments={recentAppointments}
          loading={isLoading}
        />
        <FeaturedArticlesList articles={featuredArticles} loading={isLoading} />
      </div>

      {/* ========================================== */}
      {/* [F] TOP ARTICLES BY CATEGORY */}
      {/* ========================================== */}
      {topCategories.length > 0 && (
        <TopArticlesByCategory categories={topCategories} loading={isLoading} />
      )}

      {/* ========================================== */}
      {/* [G] RECENT ACTIVITY LOG */}
      {/* ========================================== */}
      <ActivityTimeline logs={activityLogs} loading={isLoading} />
    </motion.div>
  );
}

/**
 * TopArticlesByCategory - Tabbed section showing top articles per category
 *
 * @param {Object} props
 * @param {Array<{category: Object, articles: Array}>} props.categories - Categories with top articles
 * @param {boolean} [props.loading=false] - Show skeleton loader
 */
function TopArticlesByCategory({ categories = [], loading = false }) {
  const [activeTab, setActiveTab] = useState(0);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5"
      >
        <div className="skeleton h-5 w-48 rounded mb-4" />
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-8 w-24 rounded-lg" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-16 rounded-lg mb-2" />
        ))}
      </motion.div>
    );
  }

  if (categories.length === 0) return null;

  const currentCategory = categories[activeTab];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-5 hover:shadow-md transition-shadow duration-300"
    >
      <h3 className="text-base font-semibold text-text-heading-light dark:text-text-heading-dark mb-4">
        📊 Top Articles by Category
      </h3>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
        {categories.map((cat, index) => (
          <motion.button
            key={cat.category?._id || index}
            onClick={() => setActiveTab(index)}
            whileTap={{ scale: 0.95 }}
            className={`
              relative px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200 shrink-0
              ${
                activeTab === index
                  ? "text-brand-primary bg-brand-softbg dark:bg-brand-primary/10"
                  : "text-text-para-light dark:text-text-para-dark hover:bg-gray-100 dark:hover:bg-gray-800"
              }
            `}
          >
            {cat.category?.name || "Category"}
            {activeTab === index && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Articles List */}
      <div className="space-y-3">
        {currentCategory?.articles?.map((article, index) => (
          <motion.div
            key={article._id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex-1 min-w-0 mr-3">
              <p className="text-sm font-medium text-text-heading-light dark:text-text-heading-dark truncate">
                {article.title}
              </p>
              <p className="text-xs text-text-para-light dark:text-text-para-dark mt-0.5">
                {formatDate(article.publishedAt || article.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-text-para-light dark:text-text-para-dark shrink-0">
              <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
              <span>{article.impressions?.toLocaleString() || 0}</span>
            </div>
          </motion.div>
        ))}

        {(!currentCategory?.articles ||
          currentCategory.articles.length === 0) && (
          <div className="py-6 text-center">
            <p className="text-sm text-text-para-light dark:text-text-para-dark">
              No articles in this category
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default DashboardPage;
