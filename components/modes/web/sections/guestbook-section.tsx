"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { ScaleReveal } from "@/components/modes/web/animations/scale-reveal";
import { FadeIn } from "@/components/modes/web/animations/fade-in";
import { useGuestbook } from "@/lib/guestbook/use-guestbook";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function GuestbookSection() {
  const { guestbook } = siteConfig;
  const { entries, loading, submitting, submitEntry } = useGuestbook();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [honey, setHoney] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await submitEntry(name.trim(), message.trim(), honey);
      setName("");
      setMessage("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    }
  };

  return (
    <section
      id="guestbook"
      className="border-t border-border/80 py-24 md:py-32"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <ScaleReveal initialScale={0.9}>
            <div className="space-y-3">
              <Badge
                variant="secondary"
                className="w-fit bg-accent text-accent-foreground uppercase tracking-wide"
              >
                {guestbook.badge}
              </Badge>
              <h2 className="text-3xl font-semibold md:text-4xl">
                {guestbook.title}
              </h2>
              <FadeIn delay={0.15}>
                <p className="text-muted-foreground">{guestbook.description}</p>
              </FadeIn>
            </div>
          </ScaleReveal>

          <FadeIn delay={0.3}>
            <Card className="border-border dark:border-accent-foreground/10">
              <CardHeader>
                <CardTitle className="text-lg">Sign the guestbook</CardTitle>
                <CardDescription>
                  Your message will appear alongside a tiny planet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Honeypot - hidden from real users */}
                  <input
                    type="text"
                    name="_honey"
                    value={honey}
                    onChange={(e) => setHoney(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    className="absolute opacity-0 pointer-events-none h-0 w-0"
                    aria-hidden="true"
                  />
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                    required
                  />
                  <Textarea
                    placeholder="Leave a note..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={500}
                    rows={3}
                    required
                  />
                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={submitting || !name.trim() || !message.trim()}>
                      {submitting ? "Signing..." : "Sign"}
                    </Button>
                    {submitted && (
                      <span className="text-sm text-muted-foreground">
                        Signed!
                      </span>
                    )}
                    {error && (
                      <span className="text-sm text-destructive">{error}</span>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        <FadeIn delay={0.5}>
          <div className="space-y-3 rounded-2xl border border-border/70 dark:border-accent-foreground/10 bg-background p-6 max-h-[500px] overflow-y-auto">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground sticky top-0 bg-background pb-3">
              Recent visitors
            </p>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No entries yet. Be the first to sign!
              </p>
            ) : (
              <ul className="space-y-4">
                {entries.map((entry) => (
                  <li key={entry.id} className="flex items-start gap-3">
                    <div
                      className="mt-1.5 size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: entry.planet_color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium truncate">
                          {entry.name}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDate(entry.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground break-words">
                        {entry.message}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
