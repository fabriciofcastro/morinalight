
import { PageBackground } from "@/components/layout/PageBackground";
import { ProductsListClient } from "@/components/admin/products/products-list-client";

export default function ProductsListPage() {
    return (
        <main>
            <PageBackground variant="forge" />
            <ProductsListClient />
        </main>
    );
}
