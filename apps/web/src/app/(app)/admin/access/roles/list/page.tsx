
import { PageBackground } from "@/components/layout/PageBackground";
import { RolesListClient } from "@/components/admin/access/roles/roles-list-client";

export default function RolesListPage() {
    return (
        <main>
            <PageBackground variant="vault">
                <RolesListClient />
            </PageBackground>
        </main>
    );
}
