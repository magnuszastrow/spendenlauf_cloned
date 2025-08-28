import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      {/* Desktop Navbar */}
      <nav className="sticky top-0 z-50 hidden lg:flex bg-highlight px-4 py-2">
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

      {/* Mobile Navbar */}
      <nav className="sticky top-0 z-50 lg:hidden bg-highlight px-4 py-2">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs">Logo</span>
            </div>
          </Link>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-black p-2"
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-highlight z-40 lg:hidden">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4">
                <Link to="/" onClick={() => setIsMenuOpen(false)}>
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs">Logo</span>
                  </div>
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-black p-2"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex flex-col items-center justify-start pt-8">
                <ul className="text-center space-y-6">
                  {navigationItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className={`text-black text-xl hover:text-gray-700 transition-colors ${
                          isActive(item.href) ? "font-semibold" : ""
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;