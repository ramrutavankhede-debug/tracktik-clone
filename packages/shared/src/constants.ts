export const ROLES = [
  "super_admin",
  "org_admin",
  "operations_manager",
  "dispatcher",
  "supervisor",
  "guard",
  "client_viewer",
] as const;

export type Role = (typeof ROLES)[number];

export const INCIDENT_SEVERITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

export const ALERT_TYPES = [
  "panic",
  "missed_checkpoint",
  "late_lone_worker",
  "geofence_breach",
  "missed_welfare",
] as const;

export type AlertType = (typeof ALERT_TYPES)[number];

export const PROFILE_STATUSES = ["active", "inactive"] as const;

export type ProfileStatus = (typeof PROFILE_STATUSES)[number];

export const REPORT_STATUSES = [
  "draft",
  "submitted",
  "approved",
  "rejected",
] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const INCIDENT_STATUSES = [
  "open",
  "under_review",
  "approved",
  "closed",
] as const;

export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];
