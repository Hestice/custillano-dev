"use client";

import { siteConfig } from "@/config/site";
import { FadeIn } from "@/components/modes/web/animations/fade-in";
import { TextReveal } from "@/components/modes/web/animations/text-reveal";
import { ClipReveal } from "@/components/modes/web/animations/clip-reveal";

export function HowIWorkSection() {
  const { howIWork } = siteConfig;

  // Compute grid positions for diagonal wave delay
  const cols = 3; // lg:grid-cols-3

  return (
    <section className="py-24 md:py-32 lg:py-40">
      <div className="mb-12 space-y-3">
        <TextReveal
          text="How I work"
          as="h2"
          className="text-2xl font-semibold"
          wordDelay={0.1}
        />
        <FadeIn delay={0.3}>
          <p className="text-muted-foreground">
            The principles behind every project I take on.
          </p>
        </FadeIn>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {howIWork.map((pillar, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          const delay = (row + col) * 0.1;

          return (
            <ClipReveal
              key={pillar.title}
              origin="top-left"
              delay={delay}
            >
              <div className="h-full rounded-2xl border border-border/70 dark:border-accent-foreground/10 bg-background p-6 transition-all duration-300 hover:border-accent-foreground/20 hover:bg-accent">
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
                  {pillar.title}
                </p>
                <p className="mt-3 text-sm text-foreground">{pillar.copy}</p>
              </div>
            </ClipReveal>
          );
        })}
      </div>
    </section>
  );
}
