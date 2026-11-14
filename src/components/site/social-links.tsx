import { ExternalLink } from "lucide-react";

interface SocialLinksProps {
  socials: Record<string, string>;
  className?: string;
  variant?: "footer" | "contact";
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.11V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.86-4.49V8.71a8.21 8.21 0 0 0 4.91 1.62v-3.4a4.85 4.85 0 0 1-1-.24z"/>
    </svg>
  );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function SocialLinks({ socials, className = "", variant = "footer" }: SocialLinksProps) {
  const items = [
    {
      key: "instagram",
      label: "Instagram",
      handle: "@911phonerepaironline",
      url: socials.instagram || "https://instagram.com/911phonerepaironline",
      icon: InstagramIcon,
    },
    {
      key: "tiktok",
      label: "TikTok",
      handle: "@911.phone.repair",
      url: socials.tiktok || "https://www.tiktok.com/@911.phone.repair",
      icon: TikTokIcon,
    },
    {
      key: "facebook",
      label: "Facebook",
      handle: "911 Doorstep Phone Repair",
      url: socials.facebook || "https://facebook.com/911phonerepaironline",
      icon: FacebookIcon,
    },
  ].filter((item) => Boolean(item.url));

  if (!items.length) return null;

  if (variant === "contact") {
    return (
      <div className={`space-y-2 ${className}`}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.key}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-mist"
            >
              <Icon size={18} />
              <span className="font-semibold">{item.label}</span>
              <span className="text-xs text-ink-soft">{item.handle}</span>
              <ExternalLink size={14} className="ml-auto text-steel" />
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`} aria-label="Social media profiles">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.key}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${item.label} (${item.handle})`}
            className="flex size-10 items-center justify-center rounded-full border border-line-strong bg-night text-mist transition-colors hover:border-line hover:text-on-primary"
          >
            <Icon size={18} />
          </a>
        );
      })}
    </div>
  );
}

