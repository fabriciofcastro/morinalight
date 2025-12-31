
import { PageBackground } from "@/components/layout/PageBackground";
import { BusinessSegmentForm } from "@/components/admin/business-segments/business-segment-form";

interface PageProps {
    params: {
        id: string;
    };
}

export default function EditSegmentPage({ params }: PageProps) {
    return (
        <main>
            <PageBackground variant="forge">
                <BusinessSegmentForm mode="edit" segmentId={params.id} />
            </PageBackground>
        </main>
    );
}
