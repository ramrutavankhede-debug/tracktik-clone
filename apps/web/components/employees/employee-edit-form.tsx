"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  employeeFormSchema,
  ROLES,
  type EmployeeFormInput,
} from "@guardops/shared";
import { toast } from "sonner";

import {
  createEmployeeAction,
  updateEmployeeAction,
} from "@/app/(dashboard)/employees/actions";
import { SITE_COUNTRIES, SITE_COUNTRY_OPTIONS } from "@/lib/sites/geo";
import type { EmployeeDetail } from "@/lib/employees/queries";
import { cn } from "@/lib/utils";

type Category = "general" | "address" | "roles" | "other";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "general", label: "General Information" },
  { id: "address", label: "Address" },
  { id: "roles", label: "Roles & Permissions" },
  { id: "other", label: "Other Fields" },
];

const inputClass =
  "h-9 w-full rounded border border-[#c9d3de] bg-white px-3 text-sm outline-none focus:border-[#4aa3df]";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-start gap-2 border-b border-[#eef1f5] py-3 sm:grid-cols-[200px_1fr]">
      <label className="pt-2 text-sm font-medium text-[#3d4a5c]">{label}</label>
      <div>
        {children}
        {error ? <p className="mt-1 text-xs text-accent">{error}</p> : null}
      </div>
    </div>
  );
}

type Props = {
  mode: "create" | "edit";
  employee?: EmployeeDetail;
  departments: { id: string; name: string }[];
  zones: { id: string; name: string }[];
};

export function EmployeeEditForm({
  mode,
  employee,
  departments,
  zones,
}: Props) {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("general");
  const [saving, setSaving] = useState(false);

  const form = useForm<EmployeeFormInput>({
    resolver: zodResolver(employeeFormSchema) as Resolver<EmployeeFormInput>,
    defaultValues: {
      employeeNumber: employee?.employeeNumber ?? "",
      firstName: employee?.firstName ?? "",
      middleName: employee?.middleName ?? "",
      lastName: employee?.lastName ?? "",
      jobTitle: employee?.jobTitle ?? "",
      phoneMain: employee?.phone ?? "",
      smsConsentMain: employee?.smsConsentMain ?? false,
      phoneOther: employee?.phoneOther ?? "",
      smsConsentOther: employee?.smsConsentOther ?? false,
      gender: employee?.gender ?? "Not Set",
      email: employee?.email ?? "",
      governmentBadgeId: employee?.governmentBadgeId ?? "",
      username: employee?.username ?? "",
      zoneId: employee?.zoneId ?? null,
      departmentId: employee?.departmentId ?? null,
      role: (employee?.role as EmployeeFormInput["role"]) ?? "guard",
      status: employee?.status ?? "active",
      address: employee?.address ?? "",
      addressLine2: employee?.addressLine2 ?? "",
      city: employee?.city ?? "",
      state: employee?.state ?? "",
      zipCode: employee?.zipCode ?? "",
      country: employee?.country ?? "",
    },
  });

  const country = form.watch("country");
  const states = country ? (SITE_COUNTRIES[country] ?? []) : [];

  async function onSubmit(values: EmployeeFormInput) {
    setSaving(true);
    const result =
      mode === "create"
        ? await createEmployeeAction(values)
        : await updateEmployeeAction(employee!.id, values);
    setSaving(false);

    if (!result.ok) {
      toast.error(result.message);
      form.setError("firstName", { message: result.message });
      return;
    }

    toast.success(mode === "create" ? "Employee created" : "Employee saved");
    if (mode === "create" && result.data?.id) {
      router.push(`/employees/${result.data.id}`);
    } else if (employee) {
      router.push(`/employees/${employee.id}`);
    }
    router.refresh();
  }

  return (
    <div className="-m-4 min-h-[calc(100vh-3.5rem-2.5rem)] bg-content">
      {mode === "edit" && employee ? (
        <>
          <div className="flex items-center gap-3 bg-[#1e2530] px-4 py-3 text-white">
            <h1 className="text-base font-semibold">
              {[employee.firstName, employee.lastName].filter(Boolean).join(" ")}
            </h1>
            <Link
              href={`/employees/${employee.id}`}
              className="ml-auto text-xs text-sidebar-fg hover:text-white"
            >
              ← Overview
            </Link>
          </div>
          <div className="flex flex-wrap gap-1 border-b border-[#d0d7e0] bg-[#e8ecf1] px-2 pt-2">
            <Link
              href={`/employees/${employee.id}`}
              className="rounded-t px-3 py-2 text-sm text-[#5b677a] hover:text-navy"
            >
              Overview
            </Link>
            <span className="rounded-t bg-white px-3 py-2 text-sm font-medium text-navy shadow-sm">
              Edit
            </span>
            <span className="rounded-t px-3 py-2 text-sm text-[#5b677a]">
              Skills & Attributes
            </span>
            <span className="rounded-t px-3 py-2 text-sm text-[#5b677a]">
              Security & Patrol
            </span>
          </div>
        </>
      ) : (
        <div className="flex h-11 items-center gap-2 bg-[#2c3440] px-4 text-white">
          <h1 className="text-sm font-semibold">New Employee</h1>
        </div>
      )}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4 p-4 lg:grid-cols-[220px_1fr]"
      >
        <aside className="rounded border border-[#d8dde5] bg-white p-2">
          <p className="px-2 py-2 text-xs font-bold uppercase tracking-wide text-[#6b778c]">
            Categories
          </p>
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={cn(
                "mb-1 block w-full rounded px-3 py-2 text-left text-sm",
                category === item.id
                  ? "border-l-[3px] border-[#1e88d2] bg-[#eef6fc] font-medium text-navy"
                  : "text-[#5b677a] hover:bg-[#f4f7fa]",
              )}
            >
              {item.label}
            </button>
          ))}
        </aside>

        <div className="rounded border border-[#d8dde5] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-navy">
              {CATEGORIES.find((c) => c.id === category)?.label}
            </h2>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-[#1e88d2] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Employee"}
            </button>
          </div>

          {category === "general" ? (
            <>
              <Field label="Employee ID">
                <input className={inputClass} {...form.register("employeeNumber")} />
              </Field>
              <Field label="First Name" error={form.formState.errors.firstName?.message}>
                <input className={inputClass} {...form.register("firstName")} />
              </Field>
              <Field label="Middle Name">
                <input className={inputClass} {...form.register("middleName")} />
              </Field>
              <Field label="Last Name" error={form.formState.errors.lastName?.message}>
                <input className={inputClass} {...form.register("lastName")} />
              </Field>
              <Field label="Job Title">
                <input className={inputClass} {...form.register("jobTitle")} />
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
                  <input
                    className={cn(inputClass, "sm:flex-1")}
                    placeholder="Add country code e.g. +61400-123-456"
                    {...form.register("phoneOther")}
                  />
                  <label className="flex items-start gap-2 text-xs text-[#5b677a] sm:max-w-[220px]">
                    <input type="checkbox" {...form.register("smsConsentOther")} />
                    The user agrees to receive account notifications by SMS.
                  </label>
                </div>
              </Field>
              <Field label="Gender">
                <select className={inputClass} {...form.register("gender")}>
                  <option value="Not Set">Not Set</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </Field>
              <Field label="Email" error={form.formState.errors.email?.message}>
                <input className={inputClass} {...form.register("email")} />
              </Field>
              <Field label="Government Badge ID">
                <input className={inputClass} {...form.register("governmentBadgeId")} />
              </Field>
              <Field label="Username">
                <input className={inputClass} {...form.register("username")} />
              </Field>
              <Field label="Zone">
                <select className={inputClass} {...form.register("zoneId")}>
                  <option value="">Choose one</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          ) : null}

          {category === "address" ? (
            <>
              <Field label="Address">
                <input className={inputClass} {...form.register("address")} />
              </Field>
              <Field label="Address Line 2">
                <input className={inputClass} {...form.register("addressLine2")} />
              </Field>
              <Field label="City">
                <input className={inputClass} {...form.register("city")} />
              </Field>
              <Field label="Country">
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
              </Field>
              <Field label="State / Province">
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
              <Field label="ZIP / Postal Code">
                <input className={inputClass} {...form.register("zipCode")} />
              </Field>
            </>
          ) : null}

          {category === "roles" ? (
            <>
              <Field label="Role">
                <select className={inputClass} {...form.register("role")}>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select className={inputClass} {...form.register("status")}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>
              <Field label="Department">
                <select className={inputClass} {...form.register("departmentId")}>
                  <option value="">Unassigned</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          ) : null}

          {category === "other" ? (
            <p className="py-8 text-center text-sm text-[#6b778c]">
              Custom HR fields can be configured in Settings. Placeholder for
              org-specific attributes.
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
