import Link from "next/link";

import { EmployeeEditForm } from "@/components/employees/employee-edit-form";
import {
  getEmployeeDetail,
  getEmployeeFormOptions,
} from "@/lib/employees/queries";

export default async function EditEmployeePage({
  params,
}: {
  params: { id: string };
}) {
  const [employee, options] = await Promise.all([
    getEmployeeDetail(params.id),
    getEmployeeFormOptions(),
  ]);

  if (!employee) {
    return (
      <div className="space-y-3 p-4">
        <Link href="/employees" className="text-sm text-[#1e88d2] hover:underline">
          ← Employee List
        </Link>
        <div className="rounded border border-[#d8dde5] bg-white p-6">
          <h1 className="text-xl font-semibold text-navy">Employee not found</h1>
        </div>
      </div>
    );
  }

  return (
    <EmployeeEditForm
      mode="edit"
      employee={employee}
      departments={options.departments}
      zones={options.zones}
    />
  );
}
