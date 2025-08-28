import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import HeroBanner from "./HeroBanner";

interface LayoutProps {
  children: ReactNode;
  showHero?: boolean;
}

const Layout = ({ children, showHero = true }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-background w-full">
        {/* Mobile sidebar - only visible on mobile */}
        <div className="md:hidden">
          <AppSidebar />
        </div>
        
        {/* Fixed header for desktop/tablet, mobile header with sidebar trigger */}
        <Navbar />
        
        {/* Main content with proper spacing for fixed header */}
        <div className="pt-16 md:pt-20 flex-1">
          {showHero && <HeroBanner />}
          <main className="flex-1">
            {children}
          </main>
        </div>
        
        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default Layout;