
import { PageBackground } from "@/components/layout/PageBackground";
import { RoleForm } from "@/components/admin/access/roles/role-form";

export default function NewRolePage() {
    return (
        <main>
            <PageBackground variant="vault">
                <RoleForm mode="create" />
            </PageBackground>
        </main>
    );
}
