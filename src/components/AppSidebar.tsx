import { Link, useLocation } from "react-router-dom";
import { Home, Info, Users, HelpCircle, Phone, User, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Anmeldung", url: "/anmeldung", icon: User },
  { title: "Info", url: "/info", icon: Info },
  { title: "Sponsoren", url: "/sponsoren", icon: Users },
  { title: "FAQs", url: "/faqs", icon: HelpCircle },
  { title: "Kontakt", url: "/kontakt", icon: Phone },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="bg-highlight border-r-0">
      <SidebarHeader className="bg-highlight">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs">Logo</span>
          </div>
          <h2 className="font-semibold text-foreground">Spendenlauf</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-highlight">
        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground/70">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} className="text-base py-3 h-auto">
                    <Link to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground/70">Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {user ? (
                <>
                  {isAdmin && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/admin/dashboard')} className="text-base py-3 h-auto">
                          <Link to="/admin/dashboard">
                            <Shield className="h-5 w-5" />
                            <span>Dashboard</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/admin')} className="text-base py-3 h-auto">
                          <Link to="/admin/dashboard">
                            <Shield className="h-5 w-5" />
                            <span>Export Data</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={isActive('/admin/data')} className="text-base py-3 h-auto">
                          <Link to="/admin/data">
                            <User className="h-5 w-5" />
                            <span>Data</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => signOut()} className="text-base py-3 h-auto">
                      <LogOut className="h-5 w-5" />
                      <span>Abmelden</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/auth')} className="text-base py-3 h-auto">
                    <Link to="/auth">
                      <User className="h-5 w-5" />
                      <span>Anmelden</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}