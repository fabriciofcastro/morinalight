
import { PageBackground } from "@/components/layout/PageBackground";
import { SectorForm } from "@/components/admin/sectors/sector-form";

interface PageProps {
    params: {
        id: string;
    };
}

export default function EditSectorPage({ params }: PageProps) {
    return (
        <main>
            <PageBackground variant="structure">
                <SectorForm mode="edit" sectorId={params.id} />
            </PageBackground>
        </main>
    );
}
