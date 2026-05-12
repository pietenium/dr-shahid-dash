import { z } from "zod";

/**
 * App info form schema
 */
export const AppInfoSchema = z.object({
  siteName: z.string().max(100).optional(),
  siteDescription: z.string().max(500).optional(),
  doctorName: z.string().max(100).optional(),
  doctorTitle: z.string().max(100).optional(),
  doctorSpecialty: z.string().max(200).optional(),
  doctorBio: z.string().max(5000).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(300).optional(),
  socialLinks: z
    .object({
      facebook: z.string().url().optional().or(z.literal("")),
      twitter: z.string().url().optional().or(z.literal("")),
      linkedin: z.string().url().optional().or(z.literal("")),
      youtube: z.string().url().optional().or(z.literal("")),
      instagram: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
  clinicHours: z.string().max(500).optional(),
  mapEmbedUrl: z.string().max(500).optional(),
});
