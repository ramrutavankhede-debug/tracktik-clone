"use server";

import {
  assignSiteSchema,
  employeeBulkChangeSchema,
  employeeFormSchema,
  type AssignSiteInput,
  type EmployeeBulkChangeInput,
  type EmployeeFormInput,
} from "@guardops/shared";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { DEMO_ORG_ID, emptyToNull } from "@/lib/sites/queries";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; message: string };

function toProfileRow(input: EmployeeFormInput) {
  return {
    org_id: DEMO_ORG_ID,
    employee_number: emptyToNull(input.employeeNumber),
    first_name: input.firstName,
    middle_name: emptyToNull(input.middleName),
    last_name: input.lastName,
    job_title: emptyToNull(input.jobTitle),
    phone: emptyToNull(input.phoneMain),
    phone_other: emptyToNull(input.phoneOther),
    sms_consent_main: input.smsConsentMain,
    sms_consent_other: input.smsConsentOther,
    gender: emptyToNull(input.gender) ?? "Not Set",
    email: emptyToNull(input.email),
    government_badge_id: emptyToNull(input.governmentBadgeId),
    username: emptyToNull(input.username),
    zone_id: input.zoneId ?? null,
    department_id: input.departmentId ?? null,
    role: input.role,
    status: input.status,
    address: emptyToNull(input.address),
    address_line_2: emptyToNull(input.addressLine2),
    city: emptyToNull(input.city),
    state: emptyToNull(input.state),
    zip_code: emptyToNull(input.zipCode),
    country: emptyToNull(input.country),
    updated_at: new Date().toISOString(),
  };
}

export async function createEmployeeAction(
  raw: EmployeeFormInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = employeeFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid employee data",
    };
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .insert(toProfileRow(parsed.data))
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, message: error?.message ?? "Failed to create employee" };
  }

  revalidatePath("/employees");
  return {
    ok: true,
    data: { id: (data as { id: string }).id },
    message: "Employee created",
  };
}

export async function updateEmployeeAction(
  id: string,
  raw: EmployeeFormInput,
): Promise<ActionResult> {
  const parsed = employeeFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid employee data",
    };
  }
  const supabase = createClient();
  const { org_id: _org, ...patch } = toProfileRow(parsed.data);
  const { error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", id)
    .eq("org_id", DEMO_ORG_ID);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/employees");
  revalidatePath(`/employees/${id}`);
  revalidatePath(`/employees/${id}/edit`);
  return { ok: true, message: "Employee saved" };
}

export async function bulkChangeEmployeesAction(
  raw: EmployeeBulkChangeInput,
): Promise<ActionResult<{ updated: number }>> {
  const parsed = employeeBulkChangeSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid bulk change",
    };
  }
  const input = parsed.data;
  const hasAny =
    input.applyStatus ||
    input.applyDepartment ||
    input.applyZone ||
    input.applyRole;
  if (!hasAny) {
    return { ok: false, message: "Select at least one field to apply" };
  }

  const supabase = createClient();
  const { data: beforeRows, error: fetchError } = await supabase
    .from("profiles")
    .select("id, status, department_id, zone_id, role")
    .eq("org_id", DEMO_ORG_ID)
    .in("id", input.employeeIds);

  if (fetchError) return { ok: false, message: fetchError.message };

  let updated = 0;
  for (const row of (beforeRows as
    | {
        id: string;
        status: string;
        department_id: string | null;
        zone_id: string | null;
        role: string;
      }[]
    | null) ?? []) {
    const patch: Record<string, string | null> = {
      updated_at: new Date().toISOString(),
    };
    if (input.applyStatus && input.status) patch.status = input.status;
    if (input.applyDepartment) patch.department_id = input.departmentId ?? null;
    if (input.applyZone) patch.zone_id = input.zoneId ?? null;
    if (input.applyRole && input.role) patch.role = input.role;

    const { error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", row.id)
      .eq("org_id", DEMO_ORG_ID);
    if (error) return { ok: false, message: error.message };

    await supabase.from("audit_log").insert({
      org_id: DEMO_ORG_ID,
      action: "bulk_update",
      entity: "profiles",
      entity_id: row.id,
      before: {
        status: row.status,
        department_id: row.department_id,
        zone_id: row.zone_id,
        role: row.role,
      },
      after: patch,
    });
    updated += 1;
  }

  revalidatePath("/employees");
  return {
    ok: true,
    data: { updated },
    message: `Updated ${updated} employee${updated === 1 ? "" : "s"}`,
  };
}

export async function assignEmployeeToSiteAction(
  raw: AssignSiteInput,
): Promise<ActionResult> {
  const parsed = assignSiteSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid assignment",
    };
  }
  const input = parsed.data;
  const supabase = createClient();

  if (input.isPrimary) {
    await supabase
      .from("employee_site_assignments")
      .update({ is_primary: false })
      .eq("employee_id", input.employeeId)
      .eq("org_id", DEMO_ORG_ID);
  }

  const { error } = await supabase.from("employee_site_assignments").upsert(
    {
      org_id: DEMO_ORG_ID,
      employee_id: input.employeeId,
      site_id: input.siteId,
      start_date: input.startDate || null,
      effective_rate_date: input.effectiveRateDate || null,
      rate: input.rate ?? null,
      is_primary: input.isPrimary,
      status: "active",
    },
    { onConflict: "employee_id,site_id" },
  );

  if (error) return { ok: false, message: error.message };

  revalidatePath(`/employees/${input.employeeId}`);
  return { ok: true, message: "Assigned to site" };
}

export async function setPrimaryAssignmentAction(
  employeeId: string,
  assignmentId: string,
): Promise<ActionResult> {
  const supabase = createClient();
  await supabase
    .from("employee_site_assignments")
    .update({ is_primary: false })
    .eq("employee_id", employeeId)
    .eq("org_id", DEMO_ORG_ID);

  const { error } = await supabase
    .from("employee_site_assignments")
    .update({ is_primary: true })
    .eq("id", assignmentId)
    .eq("employee_id", employeeId)
    .eq("org_id", DEMO_ORG_ID);

  if (error) return { ok: false, message: error.message };

  revalidatePath(`/employees/${employeeId}`);
  return { ok: true, message: "Primary site updated" };
}

export async function terminateEmployeeAction(
  id: string,
): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ status: "inactive", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("org_id", DEMO_ORG_ID);

  if (error) return { ok: false, message: error.message };

  await supabase.from("audit_log").insert({
    org_id: DEMO_ORG_ID,
    action: "terminate",
    entity: "profiles",
    entity_id: id,
    after: { status: "inactive" },
  });

  revalidatePath("/employees");
  revalidatePath(`/employees/${id}`);
  return { ok: true, message: "Employee terminated" };
}
