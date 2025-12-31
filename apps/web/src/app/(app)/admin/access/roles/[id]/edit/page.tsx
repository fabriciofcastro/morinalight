
import { PageBackground } from "@/components/layout/PageBackground";
import { RoleForm } from "@/components/admin/access/roles/role-form";

interface PageProps {
    params: {
        id: string;
    };
}

export default function EditRolePage({ params }: PageProps) {
    return (
        <main>
            <PageBackground variant="vault">
                <RoleForm mode="edit" roleId={params.id} />
            </PageBackground>
        </main>
    );
}
