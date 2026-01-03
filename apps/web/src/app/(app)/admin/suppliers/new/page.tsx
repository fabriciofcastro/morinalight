
import { PageBackground } from "@/components/layout/PageBackground";
import { SupplierForm } from "@/components/admin/suppliers/supplier-form";

export default function NewSupplierPage() {
    return (
        <main>
            <PageBackground variant="structure" />
            <SupplierForm mode="create" />
        </main>
    );
}
