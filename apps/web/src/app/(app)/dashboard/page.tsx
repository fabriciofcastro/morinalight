import type { Metadata } from "next";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard — Morina Light",
  description: "Visão geral do sistema",
};

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
      <DashboardClient />
    </div>
  );
}
