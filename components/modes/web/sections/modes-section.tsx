"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import type { ModeKey } from "@/config/site";
import { FadeIn } from "@/components/modes/web/animations/fade-in";
import { Parallax } from "@/components/modes/web/animations/parallax";
import { iconMap } from "./icon-map";
import { CliPreview, ImmersivePreview } from "./mode-previews";

const previewMap: Record<string, React.ComponentType> = {
  cli: CliPreview,
  immersive: ImmersivePreview,
};

export function ModesSection() {
  const { modes } = siteConfig;
  const currentMode: ModeKey = "web";

  const filteredModes = modes.filter((mode) => {
    if ("activeModes" in mode && mode.activeModes) {
      const activeModes = mode.activeModes as readonly ModeKey[];
      return activeModes.some((m) => m === currentMode);
    }
    return true;
  });

  return (
    <section id="modes" className="py-24 md:py-32">
      <FadeIn className="mb-12">
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold">Three ways to explore</h2>
          <p className="text-muted-foreground">
            You are inside the editorial web experience by default. Jump over to
            the other interfaces whenever you want a different vibe.
          </p>
        </div>
      </FadeIn>

      <div className="relative">
        {/* Decorative parallax layer */}
        <Parallax
          speed={0.15}
          className="pointer-events-none absolute -inset-8 -z-10 rounded-3xl bg-accent/5"
        >
          <div className="h-full w-full" />
        </Parallax>

        <div className="grid gap-6 md:grid-cols-2 md:gap-12">
          {filteredModes.map((mode, index) => {
            const Icon = iconMap[mode.icon];
            const isLeft = index === 0;
            const Preview = previewMap[mode.key];

            return (
              <FadeIn
                key={mode.label}
                direction={isLeft ? "left" : "right"}
                distance={60}
                delay={index * 0.15}
              >
                <Card className="flex h-full flex-col overflow-hidden border-border dark:border-accent-foreground/10 bg-card backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-foreground/30 hover:shadow-md dark:hover:shadow-accent-foreground/25">
                  {Preview && (
                    <div className="h-40 overflow-hidden">
                      <Preview />
                    </div>
                  )}
                  <CardHeader className="flex-1 space-y-4">
                    <FadeIn delay={0.2 + index * 0.15}>
                      <Badge
                        variant="outline"
                        className="w-fit text-[0.65rem]"
                      >
                        {mode.label}
                      </Badge>
                    </FadeIn>
                    <FadeIn delay={0.3 + index * 0.15}>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Icon className="size-4 text-accent-foreground" />
                        {mode.title}
                      </div>
                    </FadeIn>
                    <FadeIn delay={0.4 + index * 0.15}>
                      <CardDescription>{mode.description}</CardDescription>
                    </FadeIn>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <FadeIn delay={0.5 + index * 0.15}>
                      <Button variant="ghost" className="group px-0" asChild>
                        <Link href={mode.href}>
                          Enter {mode.label.toLowerCase()}
                          <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </FadeIn>
                  </CardFooter>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
