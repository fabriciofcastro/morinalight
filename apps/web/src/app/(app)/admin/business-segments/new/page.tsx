
import { PageBackground } from "@/components/layout/PageBackground";
import { BusinessSegmentForm } from "@/components/admin/business-segments/business-segment-form";

export default function NewSegmentPage() {
  return (
    <main>
      <PageBackground variant="forge">
        <BusinessSegmentForm mode="create" />
      </PageBackground>
    </main>
  );
}
