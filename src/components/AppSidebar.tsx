import { Link, useLocation } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getPublicNavigationItems, getAdminNavigationItems } from "@/config/navigation";
import spendenlaufLogo from "@/assets/spendenlauf_logo.png";
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

export function AppSidebar() {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  const navigationItems = getPublicNavigationItems();
  const adminItems = getAdminNavigationItems();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="bg-highlight border-r-0">
      <SidebarHeader className="bg-highlight">
        <div className="flex items-center gap-2 px-2">
          <img 
            src={spendenlaufLogo} 
            alt="Spendenlauf Logo" 
            className="w-8 h-8 rounded-full"
          />
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
                  {isAdmin && adminItems.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)} className="text-base py-3 h-auto">
                        <Link to={item.url}>
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                
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