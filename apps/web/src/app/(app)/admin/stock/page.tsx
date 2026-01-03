
import { PageBackground } from "@/components/layout/PageBackground";
import { StockDashboardClient } from "@/components/admin/stock/stock-dashboard-client";

export default function StockDashboardPage() {
    return (
        <main>
            <PageBackground variant="realtime" />
            <StockDashboardClient />
        </main>
    );
}
