/**
 * Build-time defaults. Every value is a placeholder the owner overrides from
 * /admin/settings; the settings document in MongoDB always wins.
 */
export const siteDefaults = {
  name: "Your Repair Shop",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
} as const;

export const DEFAULT_WINDOWS = ["09:00-12:00", "12:00-15:00", "15:00-18:00", "18:00-21:00"];
