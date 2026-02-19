import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Command,
  Globe,
  Joystick,
  Layers,
  Sparkles,
  Terminal,
} from "lucide-react";

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
import { EmailComposer } from "@/components/shared/email-composer";
import { PersonalizedGreeting } from "@/components/shared/personalized-greeting";
import { siteConfig } from "@/config/site";
import type { IconKey, ModeKey } from "@/config/site";


const iconMap: Record<IconKey, LucideIcon> = {
  layers: Layers,
  command: Command,
  sparkles: Sparkles,
  terminal: Terminal,
  joystick: Joystick,
  globe: Globe,
};

export const metadata: Metadata = {
  title: `${siteConfig.info.siteName} — Product, Systems, Experiments`,
  description: `${siteConfig.info.description} This is the editorial web surface.`,
};

export default function WebModeLanding() {
  const { hero, capabilities, modes, howIWork, contact, info, projects } =
    siteConfig;

  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-16 md:py-20 lg:px-8">
        <Hero hero={hero} focusAreas={info.focusAreas} />
        <Capabilities capabilities={capabilities} />
        <Projects projects={projects} />
        <Modes modes={modes} />
        <HowIWork pillars={howIWork} />
        <Contact contact={contact} />
      </div>
    </div>
  );
}

function Hero({
  hero,
  focusAreas,
}: {
  hero: typeof siteConfig.hero;
  focusAreas: typeof siteConfig.info.focusAreas;
}) {
  return (
    <section className="border-border/60 relative overflow-hidden rounded-3xl border bg-gradient-to-br from-background via-background to-muted/60 p-10 shadow-[0_20px_120px_-50px_rgba(0,0,0,0.8)]">
      <div className="flex flex-col gap-6">
        <Badge
          variant="secondary"
          className="w-fit bg-secondary/60 text-xs tracking-wide uppercase"
        >
          {hero.modeLabel}
        </Badge>
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            {focusAreas.join(" · ")}
          </p>
          <PersonalizedGreeting fallback={hero.headline} />
          <p className="text-lg text-muted-foreground sm:text-xl">
            {hero.copy}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={hero.primaryCta.href}>
              {hero.primaryCta.label} <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Capabilities({
  capabilities,
}: {
  capabilities: typeof siteConfig.capabilities;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-3" aria-label="Capabilities">
      {capabilities.map((track) => {
        const Icon = iconMap[track.icon];
        return (
          <Card key={track.title} className="h-full border-border">
            <CardHeader>
              <Badge variant="outline" className="w-fit text-xs uppercase">
                {track.title}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <Icon className="size-6 text-primary" />
              <CardDescription>{track.description}</CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}

function Projects({ projects }: { projects: typeof siteConfig.projects }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">Selected projects</h2>
        <p className="text-muted-foreground">
          A glimpse at previous collaborations and experiments.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.name} className="h-full border-border">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl">{project.name}</CardTitle>
              <CardDescription>{project.role}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground">{project.summary}</p>
              <div className="flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <Badge key={tech} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="px-0" asChild>
                <Link href={project.link} target="_blank" rel="noopener noreferrer">
                  View case study
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Modes({ modes }: { modes: typeof siteConfig.modes }) {
  const currentMode: ModeKey = "web";
  
  const filteredModes = modes.filter((mode) => {
    if ("activeModes" in mode && mode.activeModes) {
      const activeModes = mode.activeModes as readonly ModeKey[];
      return activeModes.some((m) => m === currentMode);
    }
    return true;
  });

  return (
    <section id="modes" className="space-y-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">Three ways to explore</h2>
        <p className="text-muted-foreground">
          You are inside the editorial web experience by default. Jump over to
          the other interfaces whenever you want a different vibe.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {filteredModes.map((mode) => {
          const Icon = iconMap[mode.icon];
          return (
            <Card
              key={mode.label}
              className="h-full border-border bg-card/80 backdrop-blur"
            >
              <CardHeader className="space-y-4">
                <Badge variant="outline" className="w-fit text-[0.65rem]">
                  {mode.label}
                </Badge>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Icon className="size-4 text-primary" />
                  {mode.title}
                </div>
                <CardDescription>{mode.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button variant="ghost" className="px-0" asChild>
                  <Link href={mode.href}>
                    Enter {mode.label.toLowerCase()}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function HowIWork({ pillars }: { pillars: typeof siteConfig.howIWork }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">How I work</h2>
        <p className="text-muted-foreground">
          The principles behind every project I take on.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pillars.map((pillar) => (
          <div
            key={pillar.title}
            className="rounded-2xl border border-border/70 p-6"
          >
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
              {pillar.title}
            </p>
            <p className="mt-3 text-sm text-foreground">{pillar.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact({ contact }: { contact: typeof siteConfig.contact }) {
  return (
    <section
      id="contact"
      className="grid gap-8 border-t border-border/80 pt-10 lg:grid-cols-[1.2fr_1fr]"
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Badge variant="secondary" className="w-fit uppercase tracking-wide">
            {contact.badge}
          </Badge>
          <h2 className="text-3xl font-semibold">{contact.title}</h2>
          <p className="text-muted-foreground">{contact.description}</p>
        </div>
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Early access form</CardTitle>
            <CardDescription>
              Sends straight to my inbox so we can plan the right experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailComposer />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4 rounded-2xl border border-border/70 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          What to reach out for
        </p>
        <ul className="space-y-4 text-sm text-foreground">
          {contact.reasons.map((reason) => (
            <li key={reason} className="flex items-start gap-3">
              <div className="mt-1 size-1.5 rounded-full bg-primary" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
        <Button variant="ghost" className="px-0 text-sm font-semibold" asChild>
          <Link href={`mailto:${contact.email}`}>
            {contact.email}
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
