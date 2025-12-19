import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { DepartmentFormClient } from "@/components/admin/departments/department-form-client";

export const metadata: Metadata = {
  title: "Novo Departamento | Administração",
  description: "Criar um novo departamento",
};

export default function NewDepartmentPage() {
  return (
    <PageBackground>
      <DepartmentFormClient />
    </PageBackground>
  );
}
