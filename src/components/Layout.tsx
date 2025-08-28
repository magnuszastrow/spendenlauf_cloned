import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import HeroBanner from "./HeroBanner";

interface LayoutProps {
  children: ReactNode;
  showHero?: boolean;
}

const Layout = ({ children, showHero = true }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      {showHero && <HeroBanner />}
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;