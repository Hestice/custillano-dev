import type { LucideIcon } from "lucide-react";
import {
  Command,
  Globe,
  Joystick,
  Layers,
  Sparkles,
  Terminal,
} from "lucide-react";
import type { IconKey } from "@/config/site";

export const iconMap: Record<IconKey, LucideIcon> = {
  layers: Layers,
  command: Command,
  sparkles: Sparkles,
  terminal: Terminal,
  joystick: Joystick,
  globe: Globe,
};
