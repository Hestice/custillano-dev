import type { Metadata } from "next";

import { DotGrid } from "@/components/modes/web/dot-grid";
import { LandingContent } from "@/components/modes/web/landing-content";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `${siteConfig.info.siteName} - Product, Systems, Experiments`,
  description: `${siteConfig.info.description} This is the editorial web surface.`,
};

export default function WebModeLanding() {
  return (
    <div className="bg-background text-foreground">
      <DotGrid />
      <LandingContent />
    </div>
  );
}
