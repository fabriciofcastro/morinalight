
import { PageBackground } from "@/components/layout/PageBackground";
import { ClientForm } from "@/components/admin/clients/client-form";

export default function NewClientPage() {
    return (
        <main>
            <PageBackground variant="nodes" />
            <ClientForm mode="create" />
        </main>
    );
}
