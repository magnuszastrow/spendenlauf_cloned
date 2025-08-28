import { Link, useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Navbar = () => {
  const location = useLocation();

  const navigationItems = [
    { href: "/info", label: "Info" },
    { href: "/anmeldung", label: "Anmeldung" },
    { href: "/sponsoren", label: "Sponsoren" },
    { href: "/kontakt", label: "Kontakt" },
    { href: "/faqs", label: "FAQs" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop/Tablet Fixed Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 hidden md:flex bg-highlight px-4 py-2 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs">Logo</span>
            </div>
          </Link>
          
          <div className="flex items-center space-x-8">
            <ul className="flex items-center space-x-6">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`text-black hover:text-gray-700 transition-colors ${
                      isActive(item.href) ? "font-semibold" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="ml-4">
              <div className="w-10 h-8 bg-gray-300 flex items-center justify-center">
                <span className="text-xs">Badge</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header with Sidebar Trigger */}
      <nav className="fixed top-0 left-0 right-0 z-50 md:hidden bg-highlight px-4 py-2 shadow-sm">
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