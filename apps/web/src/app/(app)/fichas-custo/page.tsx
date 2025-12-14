import { FichasCustoClient } from "./fichas-custo-client";
import { PageBackground } from "@/components/layout/PageBackground";

export const metadata = {
  title: "Fichas de Custo de Aviamentos | MORINA",
  description: "Sistema de gestão de fichas de custo de aviamentos",
};

export default function FichasCustoPage() {
  return (
    <>
      <PageBackground />
      <FichasCustoClient />
    </>
  );
}
