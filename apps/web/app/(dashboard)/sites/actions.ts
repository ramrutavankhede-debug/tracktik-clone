"use server";

import {
  bulkChangeSchema,
  newSiteSchema,
  type BulkChangeInput,
  type NewSiteInput,
} from "@guardops/shared";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { DEMO_ORG_ID, emptyToNull } from "@/lib/sites/queries";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; message: string };

export async function createSiteAction(
  raw: NewSiteInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = newSiteSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid site data",
    };
  }
  const input = parsed.data;
  const supabase = createClient();

  let accountUid = emptyToNull(input.uniqueId ?? "");
  if (!accountUid) {
    const { data: nextUid, error: uidError } = await supabase.rpc(
      "next_account_uid",
      { p_org_id: DEMO_ORG_ID },
    );
    if (uidError || !nextUid) {
      return {
        ok: false,
        message: uidError?.message ?? "Could not allocate Unique ID",
      };
    }
    accountUid = String(nextUid);
  }

  let clientId: string | null = null;
  if (input.accountType === "client" || input.accountType === "multi") {
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({
        org_id: DEMO_ORG_ID,
        name: input.companyName,
        type: input.accountType,
        main_contact: [input.contactFirstName, input.contactLastName]
          .filter(Boolean)
          .join(" "),
        phone: emptyToNull(input.phoneMain),
      })
      .select("id")
      .single();
    if (clientError || !client) {
      return {
        ok: false,
        message: clientError?.message ?? "Failed to create client",
      };
    }
    clientId = (client as { id: string }).id;
  } else if (input.parentClientId) {
    const { data: parent } = await supabase
      .from("sites")
      .select("client_id")
      .eq("id", input.parentClientId)
      .maybeSingle();
    clientId =
      (parent as { client_id: string | null } | null)?.client_id ?? null;
  }

  const { data: site, error } = await supabase
    .from("sites")
    .insert({
      org_id: DEMO_ORG_ID,
      client_id: clientId,
      parent_client_id:
        input.accountType === "site" ? (input.parentClientId ?? null) : null,
      account_uid: accountUid,
      account_type: input.accountType,
      name: input.companyName,
      address: emptyToNull(input.address),
      address_line_2: emptyToNull(input.addressLine2),
      city: emptyToNull(input.city),
      state: emptyToNull(input.state),
      zip_code: emptyToNull(input.zipCode),
      country: emptyToNull(input.country),
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      status: "active",
      site_template_id: input.siteTemplateId ?? null,
      timezone: emptyToNull(input.timezone),
      preferred_language: input.preferredLanguage || "en",
      logo_url: emptyToNull(input.logoUrl ?? undefined),
      contact_first_name: emptyToNull(input.contactFirstName),
      contact_last_name: emptyToNull(input.contactLastName),
      contact_job_title: emptyToNull(input.contactJobTitle),
      phone_main: emptyToNull(input.phoneMain),
      phone_other: emptyToNull(input.phoneOther),
      fax: emptyToNull(input.fax),
      email: emptyToNull(input.email),
      sms_consent_main: input.smsConsentMain,
      sms_consent_other: input.smsConsentOther,
      tags: input.tags ?? [],
      business_registration_number: emptyToNull(
        input.businessRegistrationNumber,
      ),
      website: emptyToNull(input.website),
      account_rep_id: input.accountRepId ?? null,
      sales_rep_id: input.salesRepId ?? null,
    })
    .select("id")
    .single();

  if (error || !site) {
    return { ok: false, message: error?.message ?? "Failed to create site" };
  }

  const siteId = (site as { id: string }).id;

  if (input.zoneIds.length > 0) {
    const { error: zoneError } = await supabase.from("site_zones").insert(
      input.zoneIds.map((zoneId) => ({ site_id: siteId, zone_id: zoneId })),
    );
    if (zoneError) {
      return { ok: false, message: zoneError.message };
    }
  }

  revalidatePath("/sites");
  return { ok: true, data: { id: siteId }, message: "Site created" };
}

export async function bulkChangeSitesAction(
  raw: BulkChangeInput,
): Promise<ActionResult<{ updated: number }>> {
  const parsed = bulkChangeSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid bulk change",
    };
  }
  const input = parsed.data;
  const hasAny =
    input.applyStatus ||
    input.applySiteTemplate ||
    input.applyAddZones ||
    input.applyRemoveZones ||
    input.applyAccountRep ||
    input.applySalesRep ||
    input.applyTimezone;
  if (!hasAny) {
    return { ok: false, message: "Select at least one field to apply" };
  }

  const supabase = createClient();
  const { data: beforeRows, error: fetchError } = await supabase
    .from("sites")
    .select(
      "id, status, site_template_id, timezone, account_rep_id, sales_rep_id, site_zones(zone_id)",
    )
    .eq("org_id", DEMO_ORG_ID)
    .in("id", input.siteIds);

  if (fetchError) {
    return { ok: false, message: fetchError.message };
  }

  type BeforeRow = {
    id: string;
    status: string;
    site_template_id: string | null;
    timezone: string | null;
    account_rep_id: string | null;
    sales_rep_id: string | null;
    site_zones: { zone_id: string }[] | null;
  };

  let updated = 0;
  for (const row of (beforeRows as BeforeRow[] | null) ?? []) {
    const patch: Record<string, string | null> = {
      updated_at: new Date().toISOString(),
    };
    if (input.applyStatus && input.status) patch.status = input.status;
    if (input.applySiteTemplate) {
      patch.site_template_id = input.siteTemplateId ?? null;
    }
    if (input.applyAccountRep) {
      patch.account_rep_id = input.accountRepId ?? null;
    }
    if (input.applySalesRep) {
      patch.sales_rep_id = input.salesRepId ?? null;
    }
    if (input.applyTimezone) {
      patch.timezone = emptyToNull(input.timezone);
    }

    const { error: updateError } = await supabase
      .from("sites")
      .update(patch)
      .eq("id", row.id)
      .eq("org_id", DEMO_ORG_ID);
    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    if (input.applyAddZones && input.addZoneIds.length > 0) {
      await supabase.from("site_zones").upsert(
        input.addZoneIds.map((zoneId) => ({
          site_id: row.id,
          zone_id: zoneId,
        })),
        { onConflict: "site_id,zone_id", ignoreDuplicates: true },
      );
    }
    if (input.applyRemoveZones && input.removeZoneIds.length > 0) {
      await supabase
        .from("site_zones")
        .delete()
        .eq("site_id", row.id)
        .in("zone_id", input.removeZoneIds);
    }

    const { data: afterZones } = await supabase
      .from("site_zones")
      .select("zone_id")
      .eq("site_id", row.id);

    await supabase.from("audit_log").insert({
      org_id: DEMO_ORG_ID,
      action: "bulk_update",
      entity: "sites",
      entity_id: row.id,
      before: {
        status: row.status,
        site_template_id: row.site_template_id,
        timezone: row.timezone,
        account_rep_id: row.account_rep_id,
        sales_rep_id: row.sales_rep_id,
        zone_ids: row.site_zones?.map((z) => z.zone_id) ?? [],
      },
      after: {
        ...patch,
        zone_ids: (
          (afterZones as { zone_id: string }[] | null) ?? []
        ).map((z) => z.zone_id),
      },
    });
    updated += 1;
  }

  revalidatePath("/sites");
  return {
    ok: true,
    data: { updated },
    message: `Updated ${updated} site${updated === 1 ? "" : "s"}`,
  };
}
