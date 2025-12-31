
import { PageBackground } from "@/components/layout/PageBackground";
import { ClientForm } from "@/components/admin/clients/client-form";

interface PageProps {
    params: {
        id: string;
    };
}

export default function EditClientPage({ params }: PageProps) {
    return (
        <main>
            <PageBackground variant="nodes" />
            <ClientForm mode="edit" clientId={params.id} />
        </main>
    );
}
