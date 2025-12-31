
import { PageBackground } from "@/components/layout/PageBackground";
import { NotificationRuleForm } from "@/components/admin/notifications/notification-rule-form";

export default function NewNotificationRulePage() {
    return (
        <main>
            <PageBackground variant="realtime" />
            <NotificationRuleForm mode="create" />
        </main>
    );
}
