"use client";

import { LazyMotion, m, useReducedMotion } from "motion/react";
import { dur, ease, stagger } from "@/lib/motion";

const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

/** Loads the animation features once, after first paint, for the public site. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}

/** Section reveal: fade + 12 px rise, once. With reduced motion only the fade remains. */
export function Reveal({ children, className, delay = 0, as = "div" }: { children: React.ReactNode; className?: string; delay?: number; as?: "div" | "li" | "section" }) {
  const reduce = useReducedMotion();
  const Tag = m[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: dur.medium, ease: ease.out, delay }}
    >
      {children}
    </Tag>
  );
}

/** Hero items: fade up 8 px, staggered 60 ms, once on load. */
export function HeroItem({ children, index = 0, className }: { children: React.ReactNode; index?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dur.medium, ease: ease.out, delay: index * stagger.hero }}
    >
      {children}
    </m.div>
  );
}
