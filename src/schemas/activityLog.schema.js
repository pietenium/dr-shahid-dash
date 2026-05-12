import { z } from "zod";

/**
 * Activity log module enum
 */
export const LogModuleSchema = z.enum([
  "articles",
  "research",
  "auth",
  "appointments",
  "contact",
  "users",
  "app-info",
  "testimonials",
]);

/**
 * Activity log schema
 */
export const ActivityLogSchema = z.object({
  _id: z.string(),
  user: z
    .object({
      _id: z.string(),
      name: z.string(),
      email: z.string(),
      role: z.string(),
    })
    .optional()
    .nullable(),
  action: z.string(),
  module: LogModuleSchema,
  targetId: z.string().optional().nullable(),
  ipAddress: z.string().optional().nullable(),
  createdAt: z.string(),
});

/**
 * Activity log filter query schema
 */
export const ActivityLogFilterQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  module: LogModuleSchema.optional(),
  userId: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});
