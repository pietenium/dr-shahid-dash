import { z } from "zod";

/**
 * Contact message status
 * @enum {string}
 */
export const ContactStatusSchema = z.enum([
  "UNREAD",
  "READ",
  "REPLIED",
  "ARCHIVED",
]);

/**
 * Contact message schema
 */
export const ContactMessageSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  message: z.string(),
  status: ContactStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
