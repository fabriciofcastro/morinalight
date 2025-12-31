
import { PageBackground } from "@/components/layout/PageBackground";
import { ProductForm } from "@/components/admin/products/product-form";

interface PageProps {
    params: {
        id: string;
    };
}

export default function EditProductPage({ params }: PageProps) {
    return (
        <main>
            <PageBackground variant="forge" />
            <ProductForm mode="edit" productId={params.id} />
        </main>
    );
}
