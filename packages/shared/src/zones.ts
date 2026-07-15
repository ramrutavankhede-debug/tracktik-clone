import { z } from "zod";

export const zoneStatusSchema = z.enum(["active", "inactive"]);
export type ZoneStatus = z.infer<typeof zoneStatusSchema>;

export const createZoneSchema = z.object({
  zoneName: z.string().min(1, "Zone Name is required").max(200),
  details: z.string().max(4000).optional().default(""),
  zoneUid: z.string().max(64).optional().default(""),
  preferredLanguage: z.string().min(2).max(16).default("en"),
  zoneTemplateId: z
    .string()
    .uuid()
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  address: z.string().max(240).optional().default(""),
  city: z.string().max(120).optional().default(""),
  country: z.string().max(120).optional().default(""),
  state: z.string().max(120).optional().default(""),
  zipCode: z.string().max(32).optional().default(""),
  calendarGroup: z.string().max(120).optional().default(""),
});

export type CreateZoneInput = z.infer<typeof createZoneSchema>;
