"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageBackground } from "@/components/layout/PageBackground";
import { Loader2 } from "lucide-react";

export default function CompanyPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/admin/company/edit");
    }, [router]);

    return (
        <>
            <PageBackground variant="dashboard" />
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))] mx-auto" />
                    <p className="mt-4 text-white/50">Redirecionando para configurações...</p>
                </div>
            </div>
        </>
    );
}
