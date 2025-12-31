
import { PageBackground } from "@/components/layout/PageBackground";
import { PermissionForm } from "@/components/admin/access/permissions/permission-form";

export default function NewPermissionPage() {
    return (
        <main>
            <PageBackground variant="vault">
                <PermissionForm mode="create" />
            </PageBackground>
        </main>
    );
}
