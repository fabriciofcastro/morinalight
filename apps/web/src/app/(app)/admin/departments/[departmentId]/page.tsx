import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { DepartmentDetailClient } from "@/components/admin/departments/department-detail-client";

export const metadata: Metadata = {
  title: "Detalhes do Departamento | Administração",
  description: "Visualizar detalhes do departamento",
};

export default function DepartmentDetailPage({
  params,
}: {
  params: { departmentId: string };
}) {
  return (
    <PageBackground>
      <DepartmentDetailClient departmentId={params.departmentId} />
    </PageBackground>
  );
}
