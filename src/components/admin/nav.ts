import {
  CalendarCheck, FileText, Images, LayoutDashboard, Search, Settings, Smartphone, Star, Tags, Users, Wrench,
} from "lucide-react";

export const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, mobile: true },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck, mobile: true },
  { href: "/admin/services", label: "Services", icon: Wrench, mobile: true },
  { href: "/admin/devices", label: "Devices", icon: Smartphone },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/seo", label: "SEO", icon: Search },
  { href: "/admin/settings", label: "Settings", icon: Settings, mobile: true, ownerOnly: true },
  { href: "/admin/users", label: "Users", icon: Users, ownerOnly: true },
] as const;
