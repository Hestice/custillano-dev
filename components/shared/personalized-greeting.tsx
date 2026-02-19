"use client";

import { useUserName } from "@/providers/user/user-provider";

interface PersonalizedGreetingProps {
  fallback: string;
}

export function PersonalizedGreeting({ fallback }: PersonalizedGreetingProps) {
  const { name } = useUserName();

  const headline = name
    ? `Hey ${name}, let\u2019s build something great together.`
    : fallback;

  return (
    <h1 className="text-balance text-4xl font-semibold leading-snug text-foreground sm:text-5xl">
      {headline}
    </h1>
  );
}
