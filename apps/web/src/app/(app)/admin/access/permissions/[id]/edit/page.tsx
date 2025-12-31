
import { PageBackground } from "@/components/layout/PageBackground";
import { PermissionForm } from "@/components/admin/access/permissions/permission-form";

interface PageProps {
    params: {
        id: string;
    };
}

export default function EditPermissionPage({ params }: PageProps) {
    return (
        <main>
            <PageBackground variant="vault">
                <PermissionForm mode="edit" permissionId={params.id} />
            </PageBackground>
        </main>
    );
}
