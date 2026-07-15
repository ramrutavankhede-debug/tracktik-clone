"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  employeeBulkChangeSchema,
  ROLES,
  type EmployeeBulkChangeInput,
} from "@guardops/shared";
import { X } from "lucide-react";

import { bulkChangeEmployeesAction } from "@/app/(dashboard)/employees/actions";
import type { EmployeeListItem } from "@/lib/employees/queries";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: EmployeeListItem[];
  departments: { id: string; name: string }[];
  zones: { id: string; name: string }[];
  onApplied: (count: number) => void;
};

const inputClass =
  "mt-1 h-9 w-full rounded border border-[#c9d3de] bg-white px-3 text-sm";

export function EmployeeBulkChangeModal({
  open,
  onOpenChange,
  employees,
  departments,
  zones,
  onApplied,
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<EmployeeBulkChangeInput>({
    resolver: zodResolver(
      employeeBulkChangeSchema,
    ) as Resolver<EmployeeBulkChangeInput>,
    defaultValues: {
      employeeIds: [],
      applyStatus: false,
      status: "active",
      applyDepartment: false,
      departmentId: null,
      applyZone: false,
      zoneId: null,
      applyRole: false,
      role: "guard",
    },
  });

  if (!open) return null;

  async function apply() {
    setSaving(true);
    setError(null);
    const result = await bulkChangeEmployeesAction({
      ...form.getValues(),
      employeeIds: employees.map((e) => e.id),
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      setConfirming(false);
      return;
    }
    setConfirming(false);
    onOpenChange(false);
    onApplied(result.data?.updated ?? employees.length);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/45 p-4 pt-16">
      <div className="relative w-full max-w-lg rounded bg-white p-6 shadow-2xl">
        <button
          type="button"
          className="absolute right-3 top-3 rounded p-1 text-[#6b778c]"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold text-navy">Bulk Change</h2>
        <p className="mb-4 text-sm text-[#6b778c]">
          Apply changes to {employees.length} selected employee
          {employees.length === 1 ? "" : "s"}
        </p>

        <div className="space-y-4 text-sm">
          <label className="flex items-start gap-3">
            <input type="checkbox" {...form.register("applyStatus")} className="mt-1" />
            <span className="flex-1">
              <span className="font-medium">Status</span>
              <select
                className={inputClass}
                disabled={!form.watch("applyStatus")}
                {...form.register("status")}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" {...form.register("applyDepartment")} className="mt-1" />
            <span className="flex-1">
              <span className="font-medium">Department</span>
              <select
                className={inputClass}
                disabled={!form.watch("applyDepartment")}
                {...form.register("departmentId")}
              >
                <option value="">Unassigned</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" {...form.register("applyZone")} className="mt-1" />
            <span className="flex-1">
              <span className="font-medium">Zone</span>
              <select
                className={inputClass}
                disabled={!form.watch("applyZone")}
                {...form.register("zoneId")}
              >
                <option value="">Unassigned</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" {...form.register("applyRole")} className="mt-1" />
            <span className="flex-1">
              <span className="font-medium">Role</span>
              <select
                className={inputClass}
                disabled={!form.watch("applyRole")}
                {...form.register("role")}
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
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
              Apply to {employees.length}
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
                : `Update ${employees.length} employees. Continue?`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
