"use server";

import { createZoneSchema, type CreateZoneInput } from "@guardops/shared";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { DEMO_ORG_ID, emptyToNull } from "@/lib/sites/queries";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; message: string };

export async function createZoneAction(
  raw: CreateZoneInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createZoneSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid zone data",
    };
  }
  const input = parsed.data;
  const supabase = createClient();

  const { data, error } = await supabase
    .from("zones")
    .insert({
      org_id: DEMO_ORG_ID,
      name: input.zoneName,
      details: emptyToNull(input.details),
      zone_uid: emptyToNull(input.zoneUid),
      preferred_language: input.preferredLanguage || "en",
      zone_template_id: input.zoneTemplateId ?? null,
      address: emptyToNull(input.address),
      city: emptyToNull(input.city),
      country: emptyToNull(input.country),
      state: emptyToNull(input.state),
      zip_code: emptyToNull(input.zipCode),
      calendar_group: emptyToNull(input.calendarGroup) ?? "Default (Not Set)",
      status: "active",
      devices_count: 0,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, message: error?.message ?? "Failed to create zone" };
  }

  revalidatePath("/sites/zones");
  return {
    ok: true,
    data: { id: (data as { id: string }).id },
    message: "Zone created",
  };
}
