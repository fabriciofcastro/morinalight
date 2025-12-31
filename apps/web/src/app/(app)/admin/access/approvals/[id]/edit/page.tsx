
import { PageBackground } from "@/components/layout/PageBackground";
import { ApprovalForm } from "@/components/admin/access/approvals/approval-form";

interface PageProps {
    params: {
        id: string;
    };
}

export default function EditApprovalPage({ params }: PageProps) {
    return (
        <main>
            <PageBackground variant="vault">
                <ApprovalForm mode="edit" policyId={params.id} />
            </PageBackground>
        </main>
    );
}
