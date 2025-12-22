import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { SubdepartmentFormClient } from "@/components/admin/subdepartments/subdepartment-form-client";

export const metadata: Metadata = {
  title: "Editar Subdepartamento | Administração",
  description: "Editar subdepartamento",
};

export default function EditSubdepartmentPage({
  params,
}: {
  params: { subdepartmentId: string };
}) {
  return (
    <PageBackground>
      <SubdepartmentFormClient subdepartmentId={params.subdepartmentId} />
    </PageBackground>
  );
}






