import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { DepartmentFormClient } from "@/components/admin/departments/department-form-client";

export const metadata: Metadata = {
  title: "Editar Departamento | Administração",
  description: "Editar informações do departamento",
};

export default function DepartmentEditPage({
  params,
}: {
  params: { departmentId: string };
}) {
  return (
    <PageBackground>
      <DepartmentFormClient departmentId={params.departmentId} />
    </PageBackground>
  );
}



