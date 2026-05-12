import { z } from "zod";

/**
 * Research upload type
 * @enum {string}
 */
export const UploadTypeSchema = z.enum(["PDF", "DOI"]);

/**
 * Research form schema
 */
export const ResearchFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(300, "Title too long"),
  description: z.string().max(2000).optional().or(z.literal("")),
  uploadType: UploadTypeSchema,
  doiUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  doiNumber: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  publishedAt: z.string().optional().nullable(),
});

/**
 * Research filter query schema
 */
export const ResearchFilterQuerySchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  uploadType: UploadTypeSchema.optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});
