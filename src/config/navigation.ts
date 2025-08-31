import { LucideIcon, User, Info, Users, HelpCircle, Phone, Shield, Database, BarChart3 } from "lucide-react";

export interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const navigationItems: NavigationItem[] = [
  { title: "Anmeldung", url: "/anmeldung", icon: User },
  { title: "Info", url: "/info", icon: Info },
  { title: "Sponsoren", url: "/sponsoren", icon: Users },
  { title: "FAQs", url: "/faqs", icon: HelpCircle },
  { title: "Kontakt", url: "/kontakt", icon: Phone },
];

export const adminNavigationItems: NavigationItem[] = [
  { title: "Dashboard", url: "/admin/dashboard", icon: BarChart3, adminOnly: true },
  { title: "Export Data", url: "/admin", icon: Shield, adminOnly: true },
  { title: "Data", url: "/admin/data", icon: Database, adminOnly: true },
];

export const getPublicNavigationItems = () => navigationItems;

export const getAdminNavigationItems = () => adminNavigationItems;

export const getAllNavigationItems = () => [...navigationItems, ...adminNavigationItems];