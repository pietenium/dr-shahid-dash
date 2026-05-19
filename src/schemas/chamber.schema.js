import { z } from "zod";

/**
 * Days of the week enum
 */
export const DAYS_OF_WEEK = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
];

/**
 * Time regex: matches formats like "09:00 AM", "05:30 PM"
 */
const TIME_REGEX = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;

/**
 * Active date schema - a single day schedule entry
 */
const activeDateSchema = z.object({
  activeDay: z.enum(
    [
      "SATURDAY",
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
    ],
    { required_error: "Day is required" },
  ),
  startTime: z
    .string()
    .min(1, "Start time is required")
    .regex(TIME_REGEX, "Format: HH:MM AM/PM (e.g. 09:00 AM)"),
  endTime: z
    .string()
    .min(1, "End time is required")
    .regex(TIME_REGEX, "Format: HH:MM AM/PM (e.g. 05:00 PM)"),
});

/**
 * Chamber creation/update schema
 */
export const chamberSchema = z.object({
  chemberName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  map: z
    .string()
    .min(1, "Map embed URL is required")
    .url("Must be a valid URL")
    .refine(
      (url) =>
        url.includes("google.com/maps") || url.includes("maps.google.com"),
      {
        message: "Must be a Google Maps embed URL",
      },
    ),
  activeDates: z
    .array(activeDateSchema)
    .min(1, "At least one active day is required")
    .refine(
      (dates) => {
        const days = dates.map((d) => d.activeDay);
        return new Set(days).size === days.length;
      },
      { message: "Duplicate days are not allowed" },
    ),
});
