
import { PageBackground } from "@/components/layout/PageBackground";
import { CategoriesListClient } from "@/components/admin/categories/categories-list-client";

export default function CategoriesListPage() {
    return (
        <main>
            <PageBackground variant="forge">
                <CategoriesListClient />
            </PageBackground>
        </main>
    );
}
