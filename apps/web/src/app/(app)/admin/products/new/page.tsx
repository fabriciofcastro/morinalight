
import { PageBackground } from "@/components/layout/PageBackground";
import { ProductForm } from "@/components/admin/products/product-form";

export default function NewProductPage() {
    return (
        <main>
            <PageBackground variant="forge" />
            <ProductForm mode="create" />
        </main>
    );
}
