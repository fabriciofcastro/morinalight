
import { PageBackground } from "@/components/layout/PageBackground";
import { BranchForm } from "@/components/admin/branches/branch-form";

interface PageProps {
    params: {
        id: string;
    };
}

export default function EditBranchPage({ params }: PageProps) {
    return (
        <main>
            <PageBackground variant="structure">
                <BranchForm mode="edit" branchId={params.id} />
            </PageBackground>
        </main>
    );
}
