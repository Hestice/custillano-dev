import type { Metadata } from "next";
import { Terminal } from "@/components/modes/cli/terminal";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Terminal — ${siteConfig.info.siteName}`,
  description: "Terminal interface for fast navigation",
};

export default function TerminalPage() {
  return (
    <div className="h-dvh w-screen overflow-hidden bg-background">
      <Terminal />
    </div>
  );
}
