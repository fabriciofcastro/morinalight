
import { PageBackground } from "@/components/layout/PageBackground";
import { NotificationsListClient } from "@/components/admin/notifications/notifications-list-client";

export default function NotificationsListPage() {
    return (
        <main>
            <PageBackground variant="realtime" />
            <NotificationsListClient />
        </main>
    );
}
