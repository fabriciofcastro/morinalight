
import { PageBackground } from "@/components/layout/PageBackground";
import { DepartmentForm } from "@/components/admin/departments/department-form";

export default function NewDepartmentPage() {
  return (
    <main>
      <PageBackground variant="structure">
        <DepartmentForm mode="create" />
      </PageBackground>
    </main>
  );
}
