import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Command,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const capabilityTracks = [
  {
    title: "Systems UX",
    description:
      "Journeys, narratives, and flows for thoughtful 2D experiences that still feel alive.",
    icon: Layers,
  },
  {
    title: "Product OS",
    description:
      "Design ops, design tokens, and component governance powered by high-signal config.",
    icon: Command,
  },
  {
    title: "Creative Tech",
    description:
      "WebGL experiments, Scroll-triggered narratives, and motion that stays performant.",
    icon: Sparkles,
  },
];

const modePreviews = [
  {
    label: "CLI Mode",
    title: "Type-first portfolio",
    description:
      "A shadcn-powered terminal for fast navigation, intended for recruiters who want signal fast.",
    href: "/terminal",
    icon: Terminal,
  },
  {
    label: "Web Mode",
    title: "Editorial narrative",
    description:
      "A tactile 2D site optimized for reading and showcasing actual product systems.",
    href: "/",
    icon: Layers,
  },
  {
    label: "Immersive Mode",
    title: "Three.js playground",
    description:
      "A gamified trail with spatial UI, interactive prototypes, and shader toys.",
    href: "/experience",
    icon: Joystick,
  },
];

const labNotes = [
  {
    title: "Dynamic theming engine",
    copy: "Configurable palettes sync across motion, typography, and even HDRI choices so each mode still feels cohesive.",
  },
  {
    title: "Email bridge",
    copy: "Shared composer component routes messages to the right inbox while keeping the experience inline.",
  },
  {
    title: "Mode-aware telemetry",
    copy: "Simple analytics hooks record which experience resonates to help prioritize future drops.",
  },
];

const contactReasons = [
  "Product design collaborations",
  "Creative technology consulting",
  "Speaking or workshop invites",
];

export const metadata: Metadata = {
  title: "custillano.dev — Product, Systems, Experiments",
  description:
    "A config-driven playground featuring CLI, web, and immersive modes. This is the editorial web surface.",
};

export default function WebModeLanding() {
  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-16 md:py-20 lg:px-8">
        <Hero />
        <Capabilities />
        <Modes />
        <Lab />
        <Contact />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="border-border/60 relative overflow-hidden rounded-3xl border bg-gradient-to-br from-background via-background to-muted/60 p-10 shadow-[0_20px_120px_-50px_rgba(0,0,0,0.8)]">
      <div className="flex flex-col gap-6">
        <Badge
          variant="secondary"
          className="w-fit bg-secondary/60 text-xs tracking-wide uppercase"
        >
          Mode · Web
        </Badge>
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Product Design · Creative Tech · Spatial UX
          </p>
          <h1 className="text-balance text-4xl font-semibold leading-snug text-foreground sm:text-5xl">
            Designing adaptive experiences with a single source of truth.
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Pick your interface—CLI, web, or immersive. Each is powered by one
            configuration file and the same design primitives, so you see the
            craft, not chaos.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="#contact">
              Collaborate <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="#modes">Preview modes</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section className="grid gap-6 lg:grid-cols-3" aria-label="Capabilities">
      {capabilityTracks.map((track) => {
        const Icon = track.icon;
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

function Modes() {
  return (
    <section id="modes" className="space-y-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">Three ways to explore</h2>
        <p className="text-muted-foreground">
          Mode switching is instant because everything reads from the same
          narrative config. Pick your vibe.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {modePreviews.map((mode) => {
          const Icon = mode.icon;
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
                    Enter mode
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

function Lab() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">Lab notes</h2>
        <p className="text-muted-foreground">
          Quick snapshots of what is being prototyped behind the scenes.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {labNotes.map((note) => (
          <div
            key={note.title}
            className="rounded-2xl border border-dashed border-border/70 p-6"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              {note.title}
            </p>
            <p className="mt-3 text-sm text-foreground">{note.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section
      id="contact"
      className="grid gap-8 border-t border-border/80 pt-10 lg:grid-cols-[1.2fr_1fr]"
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Badge variant="secondary" className="w-fit uppercase tracking-wide">
            Open for collaborations
          </Badge>
          <h2 className="text-3xl font-semibold">Tell me about your brief</h2>
          <p className="text-muted-foreground">
            The shared email composer will eventually live here. For now, drop a
            note with your focus and ideal mode.
          </p>
        </div>
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Early access form</CardTitle>
            <CardDescription>
              Sends straight to my inbox so we can plan the right experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Name" />
            <Input placeholder="Work email" type="email" />
            <Textarea placeholder="Scope, timeline, or anything else" />
          </CardContent>
          <CardFooter>
            <Button className="w-full">
              Send a note
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      <div className="space-y-4 rounded-2xl border border-border/70 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          What to reach out for
        </p>
        <ul className="space-y-4 text-sm text-foreground">
          {contactReasons.map((reason) => (
            <li key={reason} className="flex items-start gap-3">
              <div className="mt-1 size-1.5 rounded-full bg-primary" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
        <Button variant="ghost" className="px-0 text-sm font-semibold" asChild>
          <Link href="mailto:hello@custillano.dev">
            hello@custillano.dev
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
