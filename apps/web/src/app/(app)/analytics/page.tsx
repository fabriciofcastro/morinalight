import { PageBackground } from "@/components/layout/PageBackground";
import { AnalyticsDashboardClient } from "@/components/analytics/analytics-dashboard-client";

export default function AnalyticsPage() {
    return (
        <main>
            <PageBackground variant="circuit">
                <AnalyticsDashboardClient />
            </PageBackground>
        </main>
    );
}
