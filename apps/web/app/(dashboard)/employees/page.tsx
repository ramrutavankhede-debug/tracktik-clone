import { Suspense } from "react";

import { EmployeesPageClient } from "@/components/employees/employees-page-client";
import {
  getEmployeesPageData,
  type EmployeesSearchParams,
} from "@/lib/employees/queries";

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: EmployeesSearchParams;
}) {
  const data = await getEmployeesPageData(searchParams);
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading…</div>}>
      <EmployeesPageClient data={data} />
    </Suspense>
  );
}
