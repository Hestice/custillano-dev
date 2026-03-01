"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { Heart } from "lucide-react";

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
import { useLikes } from "@/lib/guestbook/use-likes";
import { useUserName } from "@/providers/user/user-provider";
import { cn } from "@/lib/utils";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CharCounter({ current, max }: { current: number; max: number }) {
  const remaining = max - current;
  const pct = current / max;
  return (
    <span
      className={cn(
        "text-xs",
        pct >= 0.95
          ? "text-destructive"
          : pct >= 0.8
            ? "text-yellow-500"
            : "text-muted-foreground"
      )}
    >
      {remaining} remaining
    </span>
  );
}

export function GuestbookSection() {
  const { guestbook } = siteConfig;
  const { entries, loading, submitting, submitEntry } = useGuestbook();
  const { isLiked, toggleLike } = useLikes();
  const { name: storedName } = useUserName();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [honey, setHoney] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (storedName && !name) {
      setName(storedName);
    }
  }, [storedName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await submitEntry(
        name.trim(),
        message.trim(),
        honey,
        turnstileToken ?? undefined
      );
      setMessage("");
      setSubmitted(true);
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  };

  const handleLike = useCallback(
    async (entryId: string) => {
      const newCount = await toggleLike(entryId);
      if (newCount !== null) {
        setLikeCounts((prev) => ({ ...prev, [entryId]: newCount }));
      }
    },
    [toggleLike]
  );

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
                  <div className="space-y-1">
                    <Input
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={50}
                      required
                    />
                    <CharCounter current={name.length} max={50} />
                  </div>
                  <div className="space-y-1">
                    <Textarea
                      placeholder="Leave a note..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={500}
                      rows={3}
                      required
                    />
                    <CharCounter current={message.length} max={500} />
                  </div>
                  {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                      onSuccess={setTurnstileToken}
                      onError={() => setTurnstileToken(null)}
                      onExpire={() => setTurnstileToken(null)}
                      options={{ size: "invisible" }}
                    />
                  )}
                  <div className="flex items-center gap-3">
                    <Button
                      type="submit"
                      disabled={
                        submitting || !name.trim() || !message.trim()
                      }
                    >
                      {submitting ? "Signing..." : "Sign"}
                    </Button>
                    {submitted && (
                      <span className="text-sm text-muted-foreground">
                        Thanks! Your message is pending review and will appear
                        once approved.
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
                    <button
                      onClick={() => handleLike(entry.id)}
                      disabled={isLiked(entry.id)}
                      className={cn(
                        "flex items-center gap-1 shrink-0 rounded-full px-2 py-1 text-xs transition-colors",
                        isLiked(entry.id)
                          ? "text-pink-500"
                          : "text-muted-foreground hover:text-pink-500"
                      )}
                    >
                      <Heart
                        className="size-3.5"
                        fill={isLiked(entry.id) ? "currentColor" : "none"}
                      />
                      <span>
                        {likeCounts[entry.id] ?? entry.likes}
                      </span>
                    </button>
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
