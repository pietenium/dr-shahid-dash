import { z } from "zod";

/**
 * Appointment status enum
 * @enum {string}
 */
export const AppointmentStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
]);

/**
 * Appointment data schema
 */
export const AppointmentSchema = z.object({
  _id: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string().email().optional().nullable(),
  message: z.string().optional().nullable(),
  preferredDate: z.string().optional().nullable(),
  preferredTime: z.string().optional().nullable(),
  status: AppointmentStatusSchema,
  ipAddress: z.string().optional().nullable(),
  location: z
    .object({
      city: z.string().optional(),
      region: z.string().optional(),
      country: z.string().optional(),
      loc: z.string().optional(),
    })
    .optional()
    .nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Appointment filter query schema
 */
export const AppointmentFilterQuerySchema = z.object({
  status: AppointmentStatusSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

/**
 * Appointment chart data schema
 */
export const AppointmentChartDataSchema = z.object({
  dailyCounts: z.array(
    z.object({
      date: z.string(),
      count: z.number(),
    }),
  ),
  monthlyCounts: z.array(
    z.object({
      month: z.string(),
      count: z.number(),
    }),
  ),
  totalCount: z.number(),
  statusDistribution: z.object({
    PENDING: z.number(),
    CONFIRMED: z.number(),
    CANCELLED: z.number(),
  }),
});
