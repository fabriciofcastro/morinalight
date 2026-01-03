import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { DepartmentsListClient } from "@/components/admin/departments/departments-list-client";

export const metadata: Metadata = {
  title: "Departamentos | Administração",
  description: "Gerenciamento de departamentos do sistema",
};

export default function DepartmentsPage() {
  return (
    <PageBackground>
      <DepartmentsListClient />
    </PageBackground>
  );
}
