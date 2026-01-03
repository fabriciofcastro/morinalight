
import { PageBackground } from "@/components/layout/PageBackground";
import { PositionForm } from "@/components/admin/positions/position-form";

export default function NewPositionPage() {
  return (
    <main>
      <PageBackground variant="structure">
        <PositionForm mode="create" />
      </PageBackground>
    </main>
  );
}
