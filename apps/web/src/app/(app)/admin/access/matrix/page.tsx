
import { PageBackground } from "@/components/layout/PageBackground";
import { PermissionMatrixClient } from "@/components/admin/access/matrix/permission-matrix-client";

export default function PermissionMatrixPage() {
    return (
        <main>
            <PageBackground variant="vault" />
            <PermissionMatrixClient />
        </main>
    );
}
