import { z } from "zod";

/**
 * Article content status
 * @enum {string}
 */
export const ContentStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);

/**
 * Article type
 * @enum {string}
 */
export const ArticleTypeSchema = z.enum(["medical", "political"]);

/**
 * Article creation/update form schema
 */
export const ArticleFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  excerpt: z
    .string()
    .max(500, "Excerpt must be under 500 characters")
    .optional()
    .or(z.literal("")),
  content: z.any(), // TipTap JSON content
  category: z.string().min(1, "Category is required"),
  type: ArticleTypeSchema,
  status: ContentStatusSchema,
  author: z.string().optional(),
  tags: z.string().optional(), // Comma-separated
  publishedAt: z.string().optional().nullable(),
});

/**
 * Article category schema
 */
export const ArticleCategorySchema = z.object({
  _id: z.string(),
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string(),
  description: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Category form schema
 */
export const CategoryFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500).optional().or(z.literal("")),
});

/**
 * Article filter query schema
 */
export const ArticleFilterQuerySchema = z.object({
  status: ContentStatusSchema.optional(),
  type: ArticleTypeSchema.optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(["newest", "oldest", "impressions"]).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});
