"use client";

import { Wrench } from "lucide-react";
import { DynamicIcon, iconNames, type IconName } from "lucide-react/dynamic";

const names = new Set<string>(iconNames);

/** Admin-chosen Lucide icon by name, falling back to a wrench for unknown names. */
export function ServiceIcon({ name, size = 24, className }: { name?: string; size?: number; className?: string }) {
  const n = name?.trim().toLowerCase().replace(/\s+/g, "-");
  if (!n || !names.has(n)) return <Wrench size={size} strokeWidth={1.5} className={className} aria-hidden />;
  return <DynamicIcon name={n as IconName} size={size} strokeWidth={1.5} className={className} aria-hidden fallback={() => <Wrench size={size} strokeWidth={1.5} className={className} />} />;
}
