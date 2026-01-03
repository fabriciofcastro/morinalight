import { PageBackground } from "@/components/layout/PageBackground";
import { ReportsManagement } from "@/components/analytics/reports-management";

export default function ReportsManagementPage() {
    return (
        <main>
            <PageBackground variant="circuit">
                <div className="p-8 pb-24">
                    <ReportsManagement />
                </div>
            </PageBackground>
        </main>
    );
}
