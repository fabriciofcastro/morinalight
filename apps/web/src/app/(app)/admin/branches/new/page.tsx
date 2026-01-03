
import { PageBackground } from "@/components/layout/PageBackground";
import { BranchForm } from "@/components/admin/branches/branch-form";

export default function NewBranchPage() {
  return (
    <main>
      <PageBackground variant="structure">
        <BranchForm mode="create" />
      </PageBackground>
    </main>
  );
}
