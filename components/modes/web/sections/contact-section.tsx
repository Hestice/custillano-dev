"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmailComposer } from "@/components/shared/email-composer";
import { siteConfig } from "@/config/site";
import { ScaleReveal } from "@/components/modes/web/animations/scale-reveal";
import { FadeIn } from "@/components/modes/web/animations/fade-in";

export function ContactSection() {
  const { contact } = siteConfig;

  return (
    <section
      id="contact"
      className="border-t border-border/80 py-24 md:py-32"
    >
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <ScaleReveal initialScale={0.9}>
            <div className="space-y-3">
              <Badge
                variant="secondary"
                className="w-fit bg-accent text-accent-foreground uppercase tracking-wide"
              >
                {contact.badge}
              </Badge>
              <h2 className="text-3xl font-semibold md:text-4xl">
                {contact.title}
              </h2>
              <FadeIn delay={0.15}>
                <p className="text-muted-foreground">{contact.description}</p>
              </FadeIn>
            </div>
          </ScaleReveal>

          <FadeIn delay={0.3}>
            <Card className="border-border dark:border-accent-foreground/10">
              <CardHeader>
                <CardTitle className="text-lg">Send a message</CardTitle>
                <CardDescription>
                  Sends straight to my inbox. No forms, no funnels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmailComposer />
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        <FadeIn delay={0.5}>
          <div className="space-y-4 rounded-2xl border border-border/70 dark:border-accent-foreground/10 bg-background p-6 transition-all duration-300 hover:border-accent-foreground/20">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              What to reach out for
            </p>
            <ul className="space-y-4 text-sm text-foreground">
              {contact.reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-3">
                  <div className="mt-1 size-1.5 rounded-full bg-accent-foreground" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
            <Button
              variant="ghost"
              className="email-glow px-0 text-sm font-semibold"
              asChild
            >
              <Link href={`mailto:${contact.email}`}>
                {contact.email}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
