
import { PageBackground } from "@/components/layout/PageBackground";
import { SectorsListClient } from "@/components/admin/sectors/sectors-list-client";

export default function SectorsListPage() {
    return (
        <main>
            <PageBackground variant="structure">
                <SectorsListClient />
            </PageBackground>
        </main>
    );
}
