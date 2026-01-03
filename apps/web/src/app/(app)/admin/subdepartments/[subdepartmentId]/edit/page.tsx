import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { SubdepartmentFormClient } from "@/components/admin/subdepartments/subdepartment-form-client";

export const metadata: Metadata = {
  title: "Editar Subdepartamento | Administração",
  description: "Editar subdepartamento",
};

export default async function EditSubdepartmentPage({

  params,
}: {
  params: Promise<{ subdepartmentId: string }>;
}) {
  const { subdepartmentId } = await params;
  return (
    <PageBackground>
      <SubdepartmentFormClient subdepartmentId={subdepartmentId} />
    </PageBackground>
  );
}






