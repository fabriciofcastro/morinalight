
import { PageBackground } from "@/components/layout/PageBackground";
import { NotificationRuleForm } from "@/components/admin/notifications/notification-rule-form";

interface PageProps {
    params: {
        id: string;
    };
}

export default function EditNotificationRulePage({ params }: PageProps) {
    return (
        <main>
            <PageBackground variant="realtime" />
            <NotificationRuleForm mode="edit" ruleId={params.id} />
        </main>
    );
}
