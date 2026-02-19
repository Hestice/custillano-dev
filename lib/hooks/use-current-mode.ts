"use client";

import { usePathname } from "next/navigation";
import type { ModeKey } from "@/config/site";

export function useCurrentMode(): ModeKey {
  const pathname = usePathname();

  if (pathname.startsWith("/terminal")) return "cli";
  if (pathname.startsWith("/experience")) return "immersive";
  return "web";
}
