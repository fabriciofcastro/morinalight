
import { PageBackground } from "@/components/layout/PageBackground";
import { PositionsListClient } from "@/components/admin/positions/positions-list-client";

export default function PositionsListPage() {
    return (
        <main>
            <PageBackground variant="structure">
                <PositionsListClient />
            </PageBackground>
        </main>
    );
}
