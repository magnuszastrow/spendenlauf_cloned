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
      <div className="min-h-screen flex bg-background w-full">
        {/* Sidebar - available on all screen sizes */}
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Fixed header for desktop/tablet, mobile header with sidebar trigger */}
          <Navbar />
        
          {/* Main content with proper spacing for fixed header */}
          <div className={showHero ? "flex-1" : "md:pt-20 flex-1"}>
            {showHero && <HeroBanner />}
            <main className="flex-1">
              {children}
            </main>
          </div>
          
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;