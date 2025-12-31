
import { PageBackground } from "@/components/layout/PageBackground";
import { BranchesListClient } from "@/components/admin/branches/branches-list-client";

export default function BranchesListPage() {
    return (
        <main>
            <PageBackground variant="structure">
                <BranchesListClient />
            </PageBackground>
        </main>
    );
}
