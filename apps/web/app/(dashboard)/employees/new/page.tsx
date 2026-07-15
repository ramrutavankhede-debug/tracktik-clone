import { EmployeeEditForm } from "@/components/employees/employee-edit-form";
import { getEmployeeFormOptions } from "@/lib/employees/queries";

export default async function NewEmployeePage() {
  const options = await getEmployeeFormOptions();
  return (
    <EmployeeEditForm
      mode="create"
      departments={options.departments}
      zones={options.zones}
    />
  );
}
