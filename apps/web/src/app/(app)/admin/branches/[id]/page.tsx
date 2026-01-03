import { Metadata } from "next";
import { PageBackground } from "@/components/layout/PageBackground";
import { BranchDetailClient } from "@/components/admin/branches/branch-detail-client";

export const metadata: Metadata = {
    title: "Detalhes da Filial | Administração",
    description: "Visualizar detalhes da filial",
};

export default async function BranchDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <PageBackground>
            <BranchDetailClient branchId={id} />
        </PageBackground>
    );
}
