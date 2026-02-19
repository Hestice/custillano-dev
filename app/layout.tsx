import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { ThemeProvider } from "@/providers/theme/theme-provider";
import { UserProvider } from "@/providers/user/user-provider";
import { FloatingToolbar } from "@/components/shared/floating-toolbar";
import { WelcomeOverlay } from "@/components/shared/welcome-overlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: siteConfig.info.siteName,
  description: siteConfig.info.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <UserProvider>
            {children}
            <WelcomeOverlay />
            <FloatingToolbar />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
