import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { SubdepartmentFormClient } from "@/components/admin/subdepartments/subdepartment-form-client";

export const metadata: Metadata = {
  title: "Novo Subdepartamento | Administração",
  description: "Criar um novo subdepartamento",
};

export default function NewSubdepartmentPage({
  searchParams,
}: {
  searchParams: { departmentId?: string };
}) {
  return (
    <PageBackground>
      <SubdepartmentFormClient departmentId={searchParams.departmentId} />
    </PageBackground>
  );
}






