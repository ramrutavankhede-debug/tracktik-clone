"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createZoneSchema, type CreateZoneInput } from "@guardops/shared";
import { Info, Users } from "lucide-react";
import { toast } from "sonner";
import type { Resolver } from "react-hook-form";

import { createZoneAction } from "@/app/(dashboard)/sites/zones/actions";
import { SITE_COUNTRIES, SITE_COUNTRY_OPTIONS } from "@/lib/sites/geo";
import type { ZoneTemplateOption } from "@/lib/zones/queries";

const inputClass =
  "h-9 w-full max-w-xl rounded border border-[#c9d3de] bg-white px-3 text-sm outline-none focus:border-[#4aa3df]";
const textareaClass =
  "min-h-[100px] w-full max-w-xl rounded border border-[#c9d3de] bg-white px-3 py-2 text-sm outline-none focus:border-[#4aa3df]";

function FormRow({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-start gap-2 border-b border-[#eef1f5] py-3 sm:grid-cols-[220px_1fr]">
      <label className="pt-2 text-sm font-medium text-[#3d4a5c]">{label}</label>
      <div>
        {children}
        {error ? (
          <p className="mt-1 text-xs text-accent">{error}</p>
        ) : null}
      </div>
    </div>
  );
}

export function CreateZoneForm({
  templates,
}: {
  templates: ZoneTemplateOption[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const form = useForm<CreateZoneInput>({
    resolver: zodResolver(createZoneSchema) as Resolver<CreateZoneInput>,
    defaultValues: {
      zoneName: "",
      details: "",
      zoneUid: "",
      preferredLanguage: "en",
      zoneTemplateId: null,
      address: "",
      city: "",
      country: "",
      state: "",
      zipCode: "",
      calendarGroup: "",
    },
  });

  const country = form.watch("country");
  const states = country ? (SITE_COUNTRIES[country] ?? []) : [];

  async function onSubmit(values: CreateZoneInput) {
    setSaving(true);
    const result = await createZoneAction(values);
    setSaving(false);
    if (!result.ok) {
      form.setError("zoneName", { message: result.message });
      return;
    }
    toast.success("Zone created");
    router.push("/sites/zones");
    router.refresh();
  }

  return (
    <div className="-m-4 min-h-[calc(100vh-3.5rem-2.5rem)] bg-content">
      <div className="flex h-11 items-center gap-2 bg-[#2c3440] px-4 text-white">
        <Users className="h-4 w-4 text-sidebar-fg" />
        <h1 className="text-sm font-semibold">Create a Zone</h1>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="m-4 rounded border border-[#d8dde5] bg-white p-4 shadow-sm"
      >
        <FormRow
          label="Zone Name"
          error={form.formState.errors.zoneName?.message}
        >
          <input className={inputClass} {...form.register("zoneName")} />
        </FormRow>
        <FormRow label="Details">
          <textarea className={textareaClass} {...form.register("details")} />
        </FormRow>
        <FormRow label="ID (Optional)">
          <input className={inputClass} {...form.register("zoneUid")} />
        </FormRow>
        <FormRow label="Preferred Language">
          <select className={inputClass} {...form.register("preferredLanguage")}>
            <option value="en">English</option>
            <option value="mi">Māori</option>
          </select>
        </FormRow>
        <FormRow label="Zone Template">
          <select className={inputClass} {...form.register("zoneTemplateId")}>
            <option value="">None</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </FormRow>

        <div className="my-4 flex max-w-3xl items-start gap-2 rounded border border-[#b6d7f0] bg-[#e8f4fc] px-3 py-2 text-sm text-[#2d4a63]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1e88d2]" />
          <p>
            If this is a patrol zone, you can set the address of where the
            patrol vehicles normally reside.
          </p>
        </div>

        <FormRow label="Address">
          <input className={inputClass} {...form.register("address")} />
        </FormRow>
        <FormRow label="City">
          <input className={inputClass} {...form.register("city")} />
        </FormRow>
        <FormRow label="Country">
          <select
            className={inputClass}
            {...form.register("country")}
            onChange={(e) => {
              form.setValue("country", e.target.value);
              form.setValue("state", "");
            }}
          >
            <option value="">Choose One</option>
            {SITE_COUNTRY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FormRow>
        <FormRow label="State / Province">
          <select
            className={inputClass}
            disabled={!country}
            {...form.register("state")}
          >
            <option value="">
              {country ? "Choose one" : "Select a country first"}
            </option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FormRow>
        <FormRow label="ZIP / Postal Code">
          <input className={inputClass} {...form.register("zipCode")} />
        </FormRow>
        <FormRow label="Calendar Group">
          <select className={inputClass} {...form.register("calendarGroup")}>
            <option value="">Default (Not Set)</option>
            <option value="Standard">Standard</option>
            <option value="Public Holidays AU">Public Holidays AU</option>
            <option value="Public Holidays NZ">Public Holidays NZ</option>
          </select>
        </FormRow>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={() => router.push("/sites/zones")}
            className="rounded border border-[#4aa3df] px-4 py-2 text-sm text-[#1e88d2]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-[#1e88d2] px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
