import { z } from "zod";

/**
 * Testimonial form schema
 */
export const TestimonialFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  designation: z.string().max(100).optional().or(z.literal("")),
  company: z.string().max(100).optional().or(z.literal("")),
  content: z.string().min(1, "Testimonial content is required").max(2000),
  rating: z.number().int().min(1, "Rating required").max(5),
  isVisible: z.boolean(),
});

/**
 * Testimonial data schema
 */
export const TestimonialSchema = z.object({
  _id: z.string(),
  name: z.string(),
  designation: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  content: z.string(),
  image: z
    .object({
      url: z.string(),
      fileId: z.string(),
    })
    .optional()
    .nullable(),
  video: z
    .object({
      url: z.string(),
      fileId: z.string(),
    })
    .optional()
    .nullable(),
  rating: z.number().int().min(1).max(5),
  isVisible: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
