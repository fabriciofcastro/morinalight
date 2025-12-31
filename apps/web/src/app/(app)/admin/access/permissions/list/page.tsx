
import { PageBackground } from "@/components/layout/PageBackground";
import { PermissionsListClient } from "@/components/admin/access/permissions/permissions-list-client";

export default function PermissionsListPage() {
    return (
        <main>
            <PageBackground variant="vault">
                <PermissionsListClient />
            </PageBackground>
        </main>
    );
}
