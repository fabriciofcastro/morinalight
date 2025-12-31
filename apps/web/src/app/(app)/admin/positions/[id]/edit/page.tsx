
import { PageBackground } from "@/components/layout/PageBackground";
import { PositionForm } from "@/components/admin/positions/position-form";

interface PageProps {
    params: {
        id: string;
    };
}

export default function EditPositionPage({ params }: PageProps) {
    return (
        <main>
            <PageBackground variant="structure">
                <PositionForm mode="edit" positionId={params.id} />
            </PageBackground>
        </main>
    );
}
