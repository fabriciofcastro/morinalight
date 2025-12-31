
import { PageBackground } from "@/components/layout/PageBackground";
import { SectorForm } from "@/components/admin/sectors/sector-form";

export default function NewSectorPage() {
  return (
    <main>
      <PageBackground variant="structure">
        <SectorForm mode="create" />
      </PageBackground>
    </main>
  );
}
