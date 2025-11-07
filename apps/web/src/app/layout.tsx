import { cn } from "@morina/ui";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeShell } from "@/components/theme-shell";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Morina Light",
  description: "Plataforma modular com foco futurista e operações eficientes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        suppressHydrationWarning
        className={cn(geistSans.variable, geistMono.variable, "antialiased")}
      >
        <ThemeShell>{children}</ThemeShell>
      </body>
    </html>
  );
}
