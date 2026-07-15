import { z } from "zod";
import { ROLES } from "./constants";

export const employeeStatusSchema = z.enum(["active", "inactive"]);
export type EmployeeStatus = z.infer<typeof employeeStatusSchema>;

const optionalUuid = z
  .string()
  .uuid()
  .nullable()
  .optional()
  .or(z.literal("").transform(() => null));

export const employeeFormSchema = z
  .object({
    employeeNumber: z.string().max(64).optional().default(""),
    firstName: z.string().min(1, "First Name is required").max(80),
    middleName: z.string().max(80).optional().default(""),
    lastName: z.string().min(1, "Last Name is required").max(80),
    jobTitle: z.string().max(120).optional().default(""),
    phoneMain: z.string().max(40).optional().default(""),
    smsConsentMain: z.boolean().default(false),
    phoneOther: z.string().max(40).optional().default(""),
    smsConsentOther: z.boolean().default(false),
    gender: z.string().max(40).optional().default("Not Set"),
    email: z.string().optional().default(""),
    governmentBadgeId: z.string().max(80).optional().default(""),
    username: z.string().max(80).optional().default(""),
    zoneId: optionalUuid,
    departmentId: optionalUuid,
    role: z.enum(ROLES).default("guard"),
    status: employeeStatusSchema.default("active"),
    address: z.string().max(240).optional().default(""),
    addressLine2: z.string().max(240).optional().default(""),
    city: z.string().max(120).optional().default(""),
    state: z.string().max(120).optional().default(""),
    zipCode: z.string().max(32).optional().default(""),
    country: z.string().max(120).optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.email && data.email.length > 0) {
      const ok = z.string().email().safeParse(data.email);
      if (!ok.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid email",
          path: ["email"],
        });
      }
    }
  });

export type EmployeeFormInput = z.infer<typeof employeeFormSchema>;

export const employeeBulkChangeSchema = z.object({
  employeeIds: z.array(z.string().uuid()).min(1),
  applyStatus: z.boolean().default(false),
  status: employeeStatusSchema.optional(),
  applyDepartment: z.boolean().default(false),
  departmentId: optionalUuid,
  applyZone: z.boolean().default(false),
  zoneId: optionalUuid,
  applyRole: z.boolean().default(false),
  role: z.enum(ROLES).optional(),
});

export type EmployeeBulkChangeInput = z.infer<typeof employeeBulkChangeSchema>;

export const assignSiteSchema = z.object({
  employeeId: z.string().uuid(),
  siteId: z.string().uuid(),
  startDate: z.string().optional().nullable(),
  effectiveRateDate: z.string().optional().nullable(),
  rate: z.number().nonnegative().optional().nullable(),
  isPrimary: z.boolean().default(false),
});

export type AssignSiteInput = z.infer<typeof assignSiteSchema>;
