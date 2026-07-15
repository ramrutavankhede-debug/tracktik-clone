import Link from "next/link";

import { EmployeeDetailClient } from "@/components/employees/employee-detail-client";
import {
  getEmployeeAssignments,
  getEmployeeDetail,
  getEmployeeFormOptions,
} from "@/lib/employees/queries";

export default async function EmployeeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [employee, assignments, options] = await Promise.all([
    getEmployeeDetail(params.id),
    getEmployeeAssignments(params.id, "all"),
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
    <EmployeeDetailClient
      employee={employee}
      assignments={assignments}
      sites={options.sites}
    />
  );
}
