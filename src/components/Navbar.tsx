import { Link, useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Shield } from "lucide-react";
import { getPublicNavigationItems, getAdminNavigationItems } from "@/config/navigation";

const Navbar = () => {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  const navigationItems = getPublicNavigationItems();
  const adminItems = getAdminNavigationItems();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Fixed Header (large screens only) */}
      <nav className="fixed top-0 left-0 right-0 z-50 hidden lg:flex bg-highlight px-4 py-2 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs">Logo</span>
            </div>
          </Link>
          
          <div className="flex items-center space-x-8">
            <ul className="flex items-center space-x-6">
              {navigationItems.map((item) => (
                <li key={item.url}>
                  <Link
                    to={item.url}
                    className={`text-black hover:text-gray-700 transition-colors ${
                      isActive(item.url) ? "font-semibold" : ""
                    }`}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
            
            {user && isAdmin && (
              <div className="ml-4 flex items-center space-x-4">
                {adminItems.map((item) => (
                  <Link
                    key={item.url}
                    to={item.url}
                    className={`text-black hover:text-gray-700 transition-colors ${
                      isActive(item.url) ? "font-semibold" : ""
                    }`}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile/Tablet Header with Sidebar Trigger */}
      <nav className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-highlight px-4 py-2 shadow-sm">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs">Logo</span>
            </div>
          </Link>

          <SidebarTrigger className="text-black" />
        </div>
      </nav>
    </>
  );
};

export default Navbar;