
import { PageBackground } from "@/components/layout/PageBackground";
import { ApprovalForm } from "@/components/admin/access/approvals/approval-form";

export default function NewApprovalPage() {
    return (
        <main>
            <PageBackground variant="vault">
                <ApprovalForm mode="create" />
            </PageBackground>
        </main>
    );
}
