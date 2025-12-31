
import { PageBackground } from "@/components/layout/PageBackground";
import { ClientsListClient } from "@/components/admin/clients/clients-list-client";

export default function ClientsListPage() {
    return (
        <main>
            <PageBackground variant="nodes">
                <ClientsListClient />
            </PageBackground>
        </main>
    );
}
