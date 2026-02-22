"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserName } from "@/providers/user/user-provider";
import { siteConfig } from "@/config/site";
import { FadeIn } from "@/components/modes/web/animations/fade-in";
import { TextReveal } from "@/components/modes/web/animations/text-reveal";
import { StaggerChildren } from "@/components/modes/web/animations/stagger-children";

export function HeroSection() {
  const { hero, info } = siteConfig;
  const { name } = useUserName();

  const headline = name
    ? `Hey ${name}, let\u2019s build something great together.`
    : hero.headline;

  return (
    <section className="flex min-h-[90vh] items-center">
      <div className="border-border/60 dark:border-accent-foreground/10 relative w-full overflow-hidden rounded-3xl border bg-gradient-to-br from-background via-background to-muted p-10 shadow-[0_20px_120px_-50px_rgba(0,0,0,0.8)] md:p-14 lg:p-20">
        <div className="flex flex-col gap-6">
          <FadeIn direction="left" delay={0.1} mount>
            <Badge
              variant="secondary"
              className="w-fit bg-accent text-accent-foreground text-xs tracking-wide uppercase"
            >
              {hero.modeLabel}
            </Badge>
          </FadeIn>

          <div className="space-y-6">
            <FadeIn delay={0.3} duration={0.8} mount>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                {info.focusAreas.join(" · ")}
              </p>
            </FadeIn>

            <TextReveal
              text={headline}
              as="h1"
              className="text-balance text-4xl font-semibold leading-snug text-foreground sm:text-5xl"
              delay={0.5}
              wordDelay={0.08}
              mount
            />

            <FadeIn delay={1.2} duration={0.7} mount>
              <p className="text-lg text-muted-foreground sm:text-xl">
                {hero.copy}
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={1.5} mount>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={hero.primaryCta.href}>
                  {hero.primaryCta.label}{" "}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href={hero.secondaryCta.href}>
                  {hero.secondaryCta.label}
                </Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
