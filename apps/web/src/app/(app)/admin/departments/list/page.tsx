
import { PageBackground } from "@/components/layout/PageBackground";
import { DepartmentsListClient } from "@/components/admin/departments/departments-list-client";

export default function DepartmentsListPage() {
    return (
        <main>
            <PageBackground variant="structure">
                <DepartmentsListClient />
            </PageBackground>
        </main>
    );
}
