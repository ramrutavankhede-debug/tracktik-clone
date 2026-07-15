"use client";

import { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bulkChangeSchema, type BulkChangeInput } from "@guardops/shared";
import { X } from "lucide-react";

import { bulkChangeSitesAction } from "@/app/(dashboard)/sites/actions";
import type {
  EmployeeOption,
  SiteListItem,
  TemplateOption,
  ZoneOption,
} from "@/lib/sites/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sites: SiteListItem[];
  zones: ZoneOption[];
  templates: TemplateOption[];
  employees: EmployeeOption[];
  onApplied: (count: number) => void;
};

const inputClass =
  "h-9 w-full rounded border border-[#c9d3de] bg-white px-3 text-sm outline-none focus:border-[#4aa3df]";

export function BulkChangeModal({
  open,
  onOpenChange,
  sites,
  zones,
  templates,
  employees,
  onApplied,
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<BulkChangeInput>({
    resolver: zodResolver(bulkChangeSchema) as Resolver<BulkChangeInput>,
    defaultValues: {
      siteIds: [],
      applyStatus: false,
      status: "active",
      applySiteTemplate: false,
      siteTemplateId: null,
      applyAddZones: false,
      addZoneIds: [],
      applyRemoveZones: false,
      removeZoneIds: [],
      applyAccountRep: false,
      accountRepId: null,
      applySalesRep: false,
      salesRepId: null,
      applyTimezone: false,
      timezone: "",
    },
  });

  if (!open) return null;

  async function apply() {
    setSaving(true);
    setError(null);
    const payload: BulkChangeInput = {
      ...form.getValues(),
      siteIds: sites.map((s) => s.id),
    };
    const result = await bulkChangeSitesAction(payload);
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      setConfirming(false);
      return;
    }
    setConfirming(false);
    onOpenChange(false);
    onApplied(result.data?.updated ?? sites.length);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/45 p-4 pt-16">
      <div className="relative w-full max-w-xl rounded bg-white p-6 shadow-2xl">
        <button
          type="button"
          aria-label="Close"
          className="absolute right-3 top-3 rounded p-1 text-[#6b778c] hover:bg-[#f1f4f8]"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-1 text-lg font-semibold text-navy">Bulk Change</h2>
        <p className="mb-4 text-sm text-[#6b778c]">
          Apply changes to {sites.length} selected site
          {sites.length === 1 ? "" : "s"}
        </p>

        <div className="space-y-4">
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" {...form.register("applyStatus")} className="mt-1" />
            <span className="flex-1">
              <span className="font-medium">Status</span>
              <select
                className={`${inputClass} mt-1`}
                disabled={!form.watch("applyStatus")}
                {...form.register("status")}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              {...form.register("applySiteTemplate")}
              className="mt-1"
            />
            <span className="flex-1">
              <span className="font-medium">Site Template</span>
              <select
                className={`${inputClass} mt-1`}
                disabled={!form.watch("applySiteTemplate")}
                {...form.register("siteTemplateId")}
              >
                <option value="">None</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <div className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              {...form.register("applyAddZones")}
              className="mt-1"
            />
            <div className="flex-1">
              <span className="font-medium">Add to Zones</span>
              <Controller
                control={form.control}
                name="addZoneIds"
                render={({ field }) => (
                  <div className="mt-1 max-h-28 space-y-1 overflow-auto rounded border border-[#e5e9ef] p-2">
                    {zones.map((z) => (
                      <label key={z.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          disabled={!form.watch("applyAddZones")}
                          checked={field.value?.includes(z.id)}
                          onChange={(e) => {
                            const next = new Set(field.value ?? []);
                            if (e.target.checked) next.add(z.id);
                            else next.delete(z.id);
                            field.onChange(Array.from(next));
                          }}
                        />
                        {z.name}
                      </label>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              {...form.register("applyRemoveZones")}
              className="mt-1"
            />
            <div className="flex-1">
              <span className="font-medium">Remove from Zones</span>
              <Controller
                control={form.control}
                name="removeZoneIds"
                render={({ field }) => (
                  <div className="mt-1 max-h-28 space-y-1 overflow-auto rounded border border-[#e5e9ef] p-2">
                    {zones.map((z) => (
                      <label key={z.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          disabled={!form.watch("applyRemoveZones")}
                          checked={field.value?.includes(z.id)}
                          onChange={(e) => {
                            const next = new Set(field.value ?? []);
                            if (e.target.checked) next.add(z.id);
                            else next.delete(z.id);
                            field.onChange(Array.from(next));
                          }}
                        />
                        {z.name}
                      </label>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              {...form.register("applyAccountRep")}
              className="mt-1"
            />
            <span className="flex-1">
              <span className="font-medium">Account representative</span>
              <select
                className={`${inputClass} mt-1`}
                disabled={!form.watch("applyAccountRep")}
                {...form.register("accountRepId")}
              >
                <option value="">Unassigned</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {`${e.firstName ?? ""} ${e.lastName ?? ""}`.trim()}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              {...form.register("applySalesRep")}
              className="mt-1"
            />
            <span className="flex-1">
              <span className="font-medium">Sales representative</span>
              <select
                className={`${inputClass} mt-1`}
                disabled={!form.watch("applySalesRep")}
                {...form.register("salesRepId")}
              >
                <option value="">Unassigned</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {`${e.firstName ?? ""} ${e.lastName ?? ""}`.trim()}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              {...form.register("applyTimezone")}
              className="mt-1"
            />
            <span className="flex-1">
              <span className="font-medium">Time Zone</span>
              <select
                className={`${inputClass} mt-1`}
                disabled={!form.watch("applyTimezone")}
                {...form.register("timezone")}
              >
                <option value="">System default</option>
                <option value="Australia/Melbourne">Australia/Melbourne</option>
                <option value="Australia/Sydney">Australia/Sydney</option>
                <option value="Australia/Brisbane">Australia/Brisbane</option>
                <option value="Australia/Perth">Australia/Perth</option>
                <option value="Pacific/Auckland">Pacific/Auckland</option>
                <option value="UTC">UTC</option>
              </select>
            </span>
          </label>
        </div>

        {error ? <p className="mt-3 text-sm text-accent">{error}</p> : null}

        <div className="mt-6 flex justify-end gap-2 border-t border-[#e5e9ef] pt-4">
          <button
            type="button"
            className="rounded border border-[#4aa3df] px-4 py-2 text-sm text-[#1e88d2]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          {!confirming ? (
            <button
              type="button"
              className="rounded bg-[#1e88d2] px-4 py-2 text-sm font-medium text-white"
              onClick={() => setConfirming(true)}
            >
              Apply to {sites.length} site{sites.length === 1 ? "" : "s"}
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              className="rounded bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              onClick={() => void apply()}
            >
              {saving
                ? "Updating…"
                : `This will update ${sites.length} sites. Continue?`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
