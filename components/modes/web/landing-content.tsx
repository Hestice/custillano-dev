"use client";

import { HeroSection } from "./sections/hero-section";
import { CapabilitiesSection } from "./sections/capabilities-section";
import { ProjectsSection } from "./sections/projects-section";
import { ModesSection } from "./sections/modes-section";
import { HowIWorkSection } from "./sections/how-i-work-section";
import { ContactSection } from "./sections/contact-section";

export function LandingContent() {
  return (
    <div className="relative z-10 mx-auto flex max-w-6xl flex-col px-6 py-16 md:py-20 lg:px-8">
      <HeroSection />
      <CapabilitiesSection />
      <ProjectsSection />
      <ModesSection />
      <HowIWorkSection />
      <ContactSection />
    </div>
  );
}
