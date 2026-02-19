import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Immersive — ${siteConfig.info.siteName}`,
  description: "3D immersive experience for spatial exploration",
};

export default function ImmersiveLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
