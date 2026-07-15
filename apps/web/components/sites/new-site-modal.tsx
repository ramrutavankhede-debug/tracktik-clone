"use client";

import { useMemo, useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newSiteSchema, type NewSiteInput } from "@guardops/shared";
import { Plus, Upload, X } from "lucide-react";

import { TypeBadge } from "@/components/sites/type-badge";
import { createSiteAction } from "@/app/(dashboard)/sites/actions";
import { createClient } from "@/lib/supabase/client";
import { SITE_COUNTRIES, SITE_COUNTRY_OPTIONS } from "@/lib/sites/geo";
import type {
  EmployeeOption,
  ParentClientOption,
  SiteListItem,
  TemplateOption,
  ZoneOption,
} from "@/lib/sites/types";
import { cn } from "@/lib/utils";

const TIMEZONES = [
  "",
  "UTC",
  "Australia/Melbourne",
  "Australia/Sydney",
  "Australia/Brisbane",
  "Australia/Perth",
  "Australia/Adelaide",
  "Pacific/Auckland",
];


type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgTimezone: string;
  zones: ZoneOption[];
  templates: TemplateOption[];
  parentClients: ParentClientOption[];
  employees: EmployeeOption[];
  onCreated: (site: SiteListItem) => void;
};

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-3 block text-sm">
      <span className="mb-1 block font-medium text-[#3d4a5c]">
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs text-accent">{error}</span> : null}
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5">
      <h3 className="mb-3 border-b border-[#d8dde5] pb-1 text-xs font-bold uppercase tracking-wide text-[#5b677a]">
        {title}
      </h3>
      {children}
    </section>
  );
}

const inputClass =
  "h-9 w-full rounded border border-[#c9d3de] bg-white px-3 text-sm outline-none focus:border-[#4aa3df]";

export function NewSiteModal({
  open,
  onOpenChange,
  orgTimezone,
  zones,
  templates,
  parentClients,
  employees,
  onCreated,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<
    { id: string; place_name: string; center: [number, number]; context?: { id: string; text: string }[] }[]
  >([]);
  const [tagDraft, setTagDraft] = useState("");
  const [empQuery, setEmpQuery] = useState({ account: "", sales: "" });

  const form = useForm<NewSiteInput>({
    resolver: zodResolver(newSiteSchema) as Resolver<NewSiteInput>,
    defaultValues: {
      accountType: "client",
      parentClientId: null,
      siteTemplateId: null,
      companyName: "",
      uniqueId: "",
      timezone: "",
      logoUrl: "",
      preferredLanguage: "en",
      contactFirstName: "",
      contactLastName: "",
      contactJobTitle: "",
      phoneMain: "",
      smsConsentMain: false,
      phoneOther: "",
      smsConsentOther: false,
      fax: "",
      email: "",
      address: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      lat: null,
      lng: null,
      zoneIds: [],
      accountRepId: null,
      salesRepId: null,
      tags: [],
      businessRegistrationNumber: "",
      website: "",
    },
  });

  const accountType = form.watch("accountType");
  const country = form.watch("country");
  const tags = form.watch("tags") ?? [];
  const states = country ? (SITE_COUNTRIES[country] ?? []) : [];

  const filteredEmployees = useMemo(() => {
    const match = (q: string) =>
      employees.filter((e) => {
        const name = `${e.firstName ?? ""} ${e.lastName ?? ""}`.toLowerCase();
        return !q || name.includes(q.toLowerCase());
      });
    return {
      account: match(empQuery.account),
      sales: match(empQuery.sales),
    };
  }, [employees, empQuery]);

  if (!open) return null;

  async function searchAddress(query: string) {
    form.setValue("address", query);
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || query.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&types=address,place&limit=5`,
      );
      const json = (await res.json()) as {
        features?: {
          id: string;
          place_name: string;
          center: [number, number];
          context?: { id: string; text: string }[];
        }[];
      };
      setAddressSuggestions(json.features ?? []);
    } catch {
      setAddressSuggestions([]);
    }
  }

  function applyAddressSuggestion(feature: {
    place_name: string;
    center: [number, number];
    context?: { id: string; text: string }[];
  }) {
    form.setValue("address", feature.place_name.split(",")[0] ?? feature.place_name);
    form.setValue("lng", feature.center[0]);
    form.setValue("lat", feature.center[1]);
    const ctx = feature.context ?? [];
    const place = ctx.find((c) => c.id.startsWith("place"))?.text;
    const region = ctx.find((c) => c.id.startsWith("region"))?.text;
    const postcode = ctx.find((c) => c.id.startsWith("postcode"))?.text;
    const countryCtx = ctx.find((c) => c.id.startsWith("country"))?.text;
    if (place) form.setValue("city", place);
    if (region) form.setValue("state", region);
    if (postcode) form.setValue("zipCode", postcode);
    if (countryCtx) form.setValue("country", countryCtx);
    setAddressSuggestions([]);
  }

  async function onLogoChange(file: File | null) {
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
    const supabase = createClient();
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("site-logos").upload(path, file, {
      upsert: true,
    });
    if (error) {
      // Soft-fail when bucket is not provisioned yet
      form.setValue("logoUrl", "");
      return;
    }
    const { data } = supabase.storage.from("site-logos").getPublicUrl(path);
    form.setValue("logoUrl", data.publicUrl);
  }

  async function onSubmit(values: NewSiteInput) {
    setSaving(true);
    const result = await createSiteAction(values);
    setSaving(false);
    if (!result.ok) {
      form.setError("companyName", { message: result.message });
      return;
    }
    onCreated({
      id: result.data!.id,
      orgId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      accountUid: values.uniqueId || "…",
      accountType: values.accountType,
      name: values.companyName,
      parentClientName:
        values.accountType === "site"
          ? (parentClients.find((p) => p.id === values.parentClientId)?.name ??
            null)
          : null,
      address: values.address || null,
      city: values.city || null,
      contactFirstName: values.contactFirstName || null,
      contactLastName: values.contactLastName || null,
      phoneMain: values.phoneMain || null,
      status: "active",
      siteTemplateId: values.siteTemplateId ?? null,
      timezone: values.timezone || null,
      zoneIds: values.zoneIds,
      accountRepId: values.accountRepId ?? null,
      salesRepId: values.salesRepId ?? null,
      openIncidents: 0,
      guardsOnDuty: 0,
      lastPatrolAt: null,
    });
    form.reset();
    setLogoPreview(null);
    onOpenChange(false);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/45 p-4 pt-10">
      <div className="relative w-full max-w-[1200px] rounded bg-white shadow-2xl">
        <button
          type="button"
          aria-label="Close"
          className="absolute right-3 top-3 rounded p-1 text-[#6b778c] hover:bg-[#f1f4f8]"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-5 w-5" />
        </button>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-navy">New Site</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <Section title="Account Type">
                <div className="space-y-2">
                  {(
                    [
                      ["client", "Regular Client"],
                      ["multi", "Multi-Site Client"],
                      ["site", "Site of a Client"],
                    ] as const
                  ).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        value={value}
                        checked={accountType === value}
                        onChange={() => form.setValue("accountType", value)}
                      />
                      <TypeBadge type={value} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                {accountType === "site" ? (
                  <Field
                    label="Parent Client"
                    required
                    error={form.formState.errors.parentClientId?.message}
                  >
                    <select
                      className={inputClass}
                      {...form.register("parentClientId")}
                    >
                      <option value="">Select parent client</option>
                      {parentClients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                ) : null}
              </Section>

              <Section title="Site Template">
                <Field label="Site Template">
                  <select className={inputClass} {...form.register("siteTemplateId")}>
                    <option value="">None</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </Section>

              <Section title="Company Information">
                <Field
                  label="Company Name"
                  required
                  error={form.formState.errors.companyName?.message}
                >
                  <input
                    className={inputClass}
                    placeholder="Enter business name"
                    {...form.register("companyName")}
                  />
                </Field>
                <Field label="Unique ID">
                  <input
                    className={inputClass}
                    placeholder="Reference ID from external systems"
                    {...form.register("uniqueId")}
                  />
                </Field>
                <Field label="Time Zone">
                  <select className={inputClass} {...form.register("timezone")}>
                    <option value="">
                      - Use the system&apos;s timezone ({orgTimezone})
                    </option>
                    {TIMEZONES.filter(Boolean).map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Logo or picture">
                  <div className="flex items-center gap-2">
                    <label className="inline-flex h-9 cursor-pointer items-center gap-1 rounded bg-[#4a5568] px-3 text-sm text-white">
                      <Upload className="h-3.5 w-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          void onLogoChange(e.target.files?.[0] ?? null)
                        }
                      />
                    </label>
                    <span className="text-xs text-[#8a93a0]">
                      {logoPreview ? "Preview ready" : "No file selected"}
                    </span>
                    {logoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-9 w-9 rounded object-cover"
                      />
                    ) : null}
                  </div>
                </Field>
                <Field label="Preferred Language">
                  <select
                    className={inputClass}
                    {...form.register("preferredLanguage")}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </Field>
              </Section>

              <Section title="Main Contact">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name">
                    <input className={inputClass} {...form.register("contactFirstName")} />
                  </Field>
                  <Field label="Last Name">
                    <input className={inputClass} {...form.register("contactLastName")} />
                  </Field>
                </div>
                <Field label="Job Title">
                  <input className={inputClass} {...form.register("contactJobTitle")} />
                </Field>
                <Field label="Phone (Main)">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input className={cn(inputClass, "sm:flex-1")} {...form.register("phoneMain")} />
                    <label className="flex items-start gap-2 text-xs text-[#5b677a] sm:max-w-[220px]">
                      <input type="checkbox" {...form.register("smsConsentMain")} />
                      The user agrees to receive account notifications by SMS.
                    </label>
                  </div>
                </Field>
                <Field label="Phone (Other)">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input className={cn(inputClass, "sm:flex-1")} {...form.register("phoneOther")} />
                    <label className="flex items-start gap-2 text-xs text-[#5b677a] sm:max-w-[220px]">
                      <input type="checkbox" {...form.register("smsConsentOther")} />
                      The user agrees to receive account notifications by SMS.
                    </label>
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Fax">
                    <input className={inputClass} {...form.register("fax")} />
                  </Field>
                  <Field label="Email" error={form.formState.errors.email?.message}>
                    <input className={inputClass} {...form.register("email")} />
                  </Field>
                </div>
              </Section>
            </div>

            <div>
              <Section title="Address">
                <Field label="Address">
                  <div className="relative">
                    <input
                      className={inputClass}
                      value={form.watch("address") ?? ""}
                      onChange={(e) => void searchAddress(e.target.value)}
                      placeholder="Start typing an address…"
                    />
                    {addressSuggestions.length > 0 ? (
                      <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded border border-[#d0d7e0] bg-white shadow">
                        {addressSuggestions.map((s) => (
                          <li key={s.id}>
                            <button
                              type="button"
                              className="block w-full px-3 py-2 text-left text-sm hover:bg-[#f4f7fa]"
                              onClick={() => applyAddressSuggestion(s)}
                            >
                              {s.place_name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </Field>
                <Field label="Address Line 2">
                  <input className={inputClass} {...form.register("addressLine2")} />
                </Field>
                <Field label="City">
                  <input className={inputClass} {...form.register("city")} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="State">
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
                  </Field>
                  <Field label="Zip Code">
                    <input className={inputClass} {...form.register("zipCode")} />
                  </Field>
                </div>
                <Field label="Country">
                  <select className={inputClass} {...form.register("country")}>
                    <option value="">Choose One</option>
                    {SITE_COUNTRY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
              </Section>

              <Section title="Zones / Groups">
                <p className="mb-2 text-xs text-[#8a93a0]">
                  Removing this site from the zone will remove any of the zone
                  settings applied to this site.
                </p>
                <Controller
                  control={form.control}
                  name="zoneIds"
                  render={({ field }) => (
                    <div className="max-h-36 space-y-2 overflow-auto rounded border border-[#e5e9ef] p-2">
                      {zones.map((z) => {
                        const checked = field.value?.includes(z.id);
                        return (
                          <label key={z.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={!!checked}
                              onChange={(e) => {
                                const next = new Set(field.value ?? []);
                                if (e.target.checked) next.add(z.id);
                                else next.delete(z.id);
                                field.onChange(Array.from(next));
                              }}
                            />
                            {z.name}
                          </label>
                        );
                      })}
                    </div>
                  )}
                />
              </Section>

              <Section title="Employee Relations">
                <Field label="Account representative">
                  <input
                    className={inputClass}
                    placeholder="Type an employee name..."
                    value={empQuery.account}
                    onChange={(e) =>
                      setEmpQuery((q) => ({ ...q, account: e.target.value }))
                    }
                    list="account-rep-list"
                  />
                  <datalist id="account-rep-list">
                    {filteredEmployees.account.map((e) => (
                      <option
                        key={e.id}
                        value={`${e.firstName ?? ""} ${e.lastName ?? ""}`.trim()}
                      />
                    ))}
                  </datalist>
                  <select
                    className={cn(inputClass, "mt-2")}
                    value={form.watch("accountRepId") ?? ""}
                    onChange={(e) =>
                      form.setValue("accountRepId", e.target.value || null)
                    }
                  >
                    <option value="">Unassigned</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {`${e.firstName ?? ""} ${e.lastName ?? ""}`.trim()}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Sales representative">
                  <input
                    className={inputClass}
                    placeholder="Type an employee name..."
                    value={empQuery.sales}
                    onChange={(e) =>
                      setEmpQuery((q) => ({ ...q, sales: e.target.value }))
                    }
                  />
                  <select
                    className={cn(inputClass, "mt-2")}
                    value={form.watch("salesRepId") ?? ""}
                    onChange={(e) =>
                      form.setValue("salesRepId", e.target.value || null)
                    }
                  >
                    <option value="">Unassigned</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {`${e.firstName ?? ""} ${e.lastName ?? ""}`.trim()}
                      </option>
                    ))}
                  </select>
                </Field>
              </Section>

              <Section title="Other / Custom Fields">
                <Field label="Searchable Tags">
                  <div className="flex flex-wrap gap-1 rounded border border-[#c9d3de] p-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded bg-[#e8f3fb] px-2 py-0.5 text-xs text-[#1e88d2]"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() =>
                            form.setValue(
                              "tags",
                              tags.filter((t) => t !== tag),
                            )
                          }
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      className="min-w-[120px] flex-1 text-sm outline-none"
                      value={tagDraft}
                      placeholder="Add tag"
                      onChange={(e) => setTagDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          const next = tagDraft.trim();
                          if (next && !tags.includes(next)) {
                            form.setValue("tags", [...tags, next]);
                          }
                          setTagDraft("");
                        }
                      }}
                    />
                  </div>
                </Field>
                <Field label="Business Registration Number">
                  <input
                    className={inputClass}
                    {...form.register("businessRegistrationNumber")}
                  />
                </Field>
                <Field
                  label="Website"
                  error={form.formState.errors.website?.message}
                >
                  <input className={inputClass} {...form.register("website")} />
                </Field>
              </Section>
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-2 border-t border-[#e5e9ef] pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded border border-[#4aa3df] px-4 py-2 text-sm text-[#1e88d2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1 rounded bg-[#1e88d2] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
