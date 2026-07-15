import { z } from "zod";

export const accountTypeSchema = z.enum(["client", "multi", "site"]);
export type AccountType = z.infer<typeof accountTypeSchema>;

export const siteStatusSchema = z.enum(["active", "inactive"]);
export type SiteStatus = z.infer<typeof siteStatusSchema>;

const optionalUuid = z
  .string()
  .uuid()
  .nullable()
  .optional()
  .or(z.literal("").transform(() => null));

export const newSiteSchema = z
  .object({
    accountType: accountTypeSchema,
    parentClientId: optionalUuid,
    siteTemplateId: optionalUuid,
    companyName: z.string().min(1, "Company Name is required").max(200),
    uniqueId: z.string().max(64).optional().default(""),
    timezone: z.string().max(80).optional().default(""),
    logoUrl: z.string().optional().nullable().default(""),
    preferredLanguage: z.string().min(2).max(16).default("en"),
    contactFirstName: z.string().max(80).optional().default(""),
    contactLastName: z.string().max(80).optional().default(""),
    contactJobTitle: z.string().max(120).optional().default(""),
    phoneMain: z.string().max(40).optional().default(""),
    smsConsentMain: z.boolean().default(false),
    phoneOther: z.string().max(40).optional().default(""),
    smsConsentOther: z.boolean().default(false),
    fax: z.string().max(40).optional().default(""),
    email: z.string().optional().default(""),
    address: z.string().max(240).optional().default(""),
    addressLine2: z.string().max(240).optional().default(""),
    city: z.string().max(120).optional().default(""),
    state: z.string().max(120).optional().default(""),
    zipCode: z.string().max(32).optional().default(""),
    country: z.string().max(120).optional().default(""),
    lat: z.number().nullable().optional(),
    lng: z.number().nullable().optional(),
    zoneIds: z.array(z.string().uuid()).default([]),
    accountRepId: optionalUuid,
    salesRepId: optionalUuid,
    tags: z.array(z.string().min(1).max(40)).default([]),
    businessRegistrationNumber: z.string().max(80).optional().default(""),
    website: z.string().optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.accountType === "site" && !data.parentClientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Parent Client is required for Site of a Client",
        path: ["parentClientId"],
      });
    }
    if (data.email && data.email.length > 0) {
      const emailCheck = z.string().email().safeParse(data.email);
      if (!emailCheck.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid email",
          path: ["email"],
        });
      }
    }
    if (data.website && data.website.length > 0) {
      const urlCheck = z.string().url().safeParse(data.website);
      if (!urlCheck.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid URL",
          path: ["website"],
        });
      }
    }
    if (data.logoUrl && data.logoUrl.length > 0) {
      const urlCheck = z.string().url().safeParse(data.logoUrl);
      if (!urlCheck.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid logo URL",
          path: ["logoUrl"],
        });
      }
    }
  });

export type NewSiteInput = z.infer<typeof newSiteSchema>;

export const bulkChangeSchema = z.object({
  siteIds: z.array(z.string().uuid()).min(1),
  applyStatus: z.boolean().default(false),
  status: siteStatusSchema.optional(),
  applySiteTemplate: z.boolean().default(false),
  siteTemplateId: optionalUuid,
  applyAddZones: z.boolean().default(false),
  addZoneIds: z.array(z.string().uuid()).default([]),
  applyRemoveZones: z.boolean().default(false),
  removeZoneIds: z.array(z.string().uuid()).default([]),
  applyAccountRep: z.boolean().default(false),
  accountRepId: optionalUuid,
  applySalesRep: z.boolean().default(false),
  salesRepId: optionalUuid,
  applyTimezone: z.boolean().default(false),
  timezone: z.string().max(80).optional().default(""),
});

export type BulkChangeInput = z.infer<typeof bulkChangeSchema>;
