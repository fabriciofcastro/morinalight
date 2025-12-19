import { FichasCustoListClient } from "./fichas-custo-list-client";
import { PageBackground } from "@/components/layout/PageBackground";

export const metadata = {
  title: "Fichas de Custo - Lista | MORINA",
  description: "Lista de fichas de custo de aviamentos",
};

export default function FichasCustoListPage() {
  return (
    <>
      <PageBackground />
      <FichasCustoListClient />
    </>
  );
}









