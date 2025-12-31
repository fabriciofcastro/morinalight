
import { PageBackground } from "@/components/layout/PageBackground";
import { SupplierForm } from "@/components/admin/suppliers/supplier-form";

interface PageProps {
    params: {
        id: string;
    };
}

export default function EditSupplierPage({ params }: PageProps) {
    return (
        <main>
            <PageBackground variant="structure" />
            <SupplierForm mode="edit" supplierId={params.id} />
        </main>
    );
}
