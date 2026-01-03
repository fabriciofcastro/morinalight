
import { PageBackground } from "@/components/layout/PageBackground";
import { DepartmentForm } from "@/components/admin/departments/department-form";

interface PageProps {
    params: {
        id: string;
    };
}

export default function EditDepartmentPage({ params }: PageProps) {
    return (
        <main>
            <PageBackground variant="structure">
                <DepartmentForm mode="edit" departmentId={params.id} />
            </PageBackground>
        </main>
    );
}
