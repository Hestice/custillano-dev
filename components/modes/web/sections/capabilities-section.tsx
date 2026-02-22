"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { FadeIn } from "@/components/modes/web/animations/fade-in";
import { StaggerChildren } from "@/components/modes/web/animations/stagger-children";
import { ScaleReveal } from "@/components/modes/web/animations/scale-reveal";
import { iconMap } from "./icon-map";

export function CapabilitiesSection() {
  const { capabilities } = siteConfig;

  return (
    <section className="py-24 md:py-32 lg:py-40" aria-label="Capabilities">
      <FadeIn direction="left" className="mb-12">
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold">Capabilities</h2>
          <p className="text-muted-foreground">
            Core areas where I deliver the most impact.
          </p>
        </div>
      </FadeIn>

      <StaggerChildren
        className="grid gap-8 lg:grid-cols-3"
        staggerDelay={0.15}
        distance={30}
      >
        {capabilities.map((track) => {
          const Icon = iconMap[track.icon];
          return (
            <Card
              key={track.title}
              className="h-full border-border dark:border-accent-foreground/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-foreground/30 hover:shadow-md dark:hover:shadow-accent-foreground/25"
            >
              <CardHeader>
                <Badge variant="outline" className="w-fit text-xs uppercase">
                  {track.title}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScaleReveal initialScale={0.5} delay={0.1}>
                  <Icon className="size-6 text-accent-foreground" />
                </ScaleReveal>
                <CardDescription>{track.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </StaggerChildren>
    </section>
  );
}
