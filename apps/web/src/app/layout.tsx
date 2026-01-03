import { cn } from "@morina/ui";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ConnectionProviders } from "@/components/connection-providers";
import { ThemeShell } from "@/components/theme-shell";
import { QueryProvider } from "@/lib/query/provider";
import { AdvancedErrorBoundary } from "@/lib/errors";
import { CookieConsent } from "@/components/legal/cookie-consent";

import "./globals.css";

const interSans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppinsDisplay = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <html lang="pt-BR" data-profile="web" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(interSans.variable, poppinsDisplay.variable, "antialiased")}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
            enableColorScheme={false}
          >
            <AdvancedErrorBoundary module="root" autoResetDelay={5000}>
              <ThemeShell>{children}</ThemeShell>
              <ConnectionProviders />
              <CookieConsent />
            </AdvancedErrorBoundary>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
