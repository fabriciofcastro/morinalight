
import { PageBackground } from "@/components/layout/PageBackground";
import { ApprovalsListClient } from "@/components/admin/access/approvals/approvals-list-client";

export default function ApprovalsListPage() {
    return (
        <main>
            <PageBackground variant="vault">
                <ApprovalsListClient />
            </PageBackground>
        </main>
    );
}
