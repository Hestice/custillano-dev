"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { FadeIn } from "@/components/modes/web/animations/fade-in";
import { ScaleReveal } from "@/components/modes/web/animations/scale-reveal";
import { StaggerChildren } from "@/components/modes/web/animations/stagger-children";

export function ProjectsSection() {
  const { projects } = siteConfig;

  return (
    <section className="px-6 py-24 md:py-32 lg:px-8 lg:py-40">
      <FadeIn className="mb-12">
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold">Projects</h2>
          <p className="text-muted-foreground">
            A glimpse at previous collaborations and experiments.
          </p>
        </div>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-2">
        {projects.map((project, index) => (
          <ScaleReveal
            key={project.name}
            initialScale={0.85}
            delay={index * 0.12}
          >
            <Card className="h-full border-border dark:border-accent-foreground/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-foreground/30 hover:shadow-md dark:hover:shadow-accent-foreground/25">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl">{project.name}</CardTitle>
                <CardDescription>{project.role}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-foreground">{project.summary}</p>
                <StaggerChildren
                  className="flex flex-wrap gap-2"
                  staggerDelay={0.05}
                  direction="left"
                  distance={16}
                >
                  {project.stack.map((tech) => (
                    <Badge key={tech} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </StaggerChildren>
              </CardContent>
              <CardFooter>
                <FadeIn direction="right" delay={0.3}>
                  <Button variant="ghost" className="group px-0" asChild>
                    <Link
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View live site
                      <ExternalLink className="ml-2 size-4 transition-transform group-hover:-translate-y-0.5" />
                    </Link>
                  </Button>
                </FadeIn>
              </CardFooter>
            </Card>
          </ScaleReveal>
        ))}
      </div>
    </section>
  );
}
