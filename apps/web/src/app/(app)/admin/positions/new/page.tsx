import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { PositionFormClient } from "@/components/admin/positions/position-form-client";

export const metadata: Metadata = {
  title: "Novo Cargo | Administração",
  description: "Criar um novo cargo",
};

export default function NewPositionPage() {
  return (
    <PageBackground>
      <PositionFormClient />
    </PageBackground>
  );
}
