"use client";

import { AppLayout as MainLayout } from "@/components/layout/app-layout";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
