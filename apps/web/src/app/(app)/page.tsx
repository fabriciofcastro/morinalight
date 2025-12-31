import { PageBackground } from "@/components/layout/PageBackground";
import { ExecutiveDashboardClient } from "@/components/dashboard/executive-dashboard-client";

export default function HomePage() {
    return (
        <main>
            <PageBackground variant="circuit">
                <ExecutiveDashboardClient />
            </PageBackground>
        </main>
    );
}
