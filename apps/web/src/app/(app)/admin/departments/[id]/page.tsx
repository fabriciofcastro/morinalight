import { PageBackground } from "@/components/layout/PageBackground";
import { DepartmentDetailClient } from "@/components/admin/departments/department-detail-client";

export default async function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <PageBackground variant="structure">
            <DepartmentDetailClient departmentId={id} />
        </PageBackground>
    );
}
