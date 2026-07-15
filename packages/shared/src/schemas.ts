import { z } from "zod";
import {
  ALERT_TYPES,
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
  PROFILE_STATUSES,
  REPORT_STATUSES,
  ROLES,
} from "./constants";

export const roleSchema = z.enum(ROLES);
export const incidentSeveritySchema = z.enum(INCIDENT_SEVERITIES);
export const alertTypeSchema = z.enum(ALERT_TYPES);
export const profileStatusSchema = z.enum(PROFILE_STATUSES);
export const reportStatusSchema = z.enum(REPORT_STATUSES);
export const incidentStatusSchema = z.enum(INCIDENT_STATUSES);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const orgOnboardingSchema = z.object({
  organizationName: z.string().min(2).max(120),
  country: z.string().min(2).max(80),
  timezone: z.string().min(2).max(80),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().min(7).max(32).optional(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  acceptTerms: z.literal(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type OrgOnboardingInput = z.infer<typeof orgOnboardingSchema>;
