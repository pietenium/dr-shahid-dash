import { z } from "zod";

/**
 * Geo analytics data schema
 */
export const GeoAnalyticsSchema = z.object({
  country: z.string(),
  count: z.number(),
  percentage: z.number().optional(),
});

/**
 * Page analytics data schema
 */
export const PageAnalyticsSchema = z.object({
  page: z.string(),
  visits: z.number(),
  uniqueVisitors: z.number().optional(),
});

/**
 * Dashboard stats schema
 */
export const DashboardStatsSchema = z.object({
  totalAppointments: z.number(),
  pendingAppointments: z.number(),
  totalPageViews: z.number(),
  activeVisitors: z.number(),
});
