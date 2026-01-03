
import { PageBackground } from "@/components/layout/PageBackground";
import { SuppliersListClient } from "@/components/admin/suppliers/suppliers-list-client";

export default function SuppliersListPage() {
    return (
        <main>
            <PageBackground variant="structure" />
            <SuppliersListClient />
        </main>
    );
}
