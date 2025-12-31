
import { PageBackground } from "@/components/layout/PageBackground";
import { NotificationsDashboardClient } from "@/components/admin/notifications/notifications-dashboard-client";

export default function NotificationsDashboardPage() {
    return (
        <main>
            {/* Using 'realtime' variant as it fits the monitoring/notification theme perfectly */}
            <PageBackground variant="realtime" />
            <NotificationsDashboardClient />
        </main>
    );
}
