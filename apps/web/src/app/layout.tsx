import { Providers } from "@/app/providers";
import { ConnectionProviders } from "@/components/connection-providers";
import { CookieConsent } from "@/components/legal/cookie-consent";
import { ThemeShell } from "@/components/theme-shell";
import { AdvancedErrorBoundary } from "@/lib/errors";
import { cn } from "@morina/ui/server";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter, Poppins } from "next/font/google";

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
        <Providers>
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
        </Providers>
      </body>
    </html>
  );
}
