import { useAuth } from "@/contexts/AuthContext";

const Footer = () => {
  const { user, signOut } = useAuth();
  return (
    <footer className="bg-muted/50 border-t border-border p-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
            <a 
              href="/impressum"
              className="hover:text-primary transition-colors"
            >
              Impressum
            </a>
            <a 
              href="/datenschutz"
              className="hover:text-primary transition-colors"
            >
              Datenschutz
            </a>
            <a 
              href="/kontakt"
              className="hover:text-primary transition-colors"
            >
              Kontakt
            </a>
            <a 
              href="https://instagram.com/spendenlauf_luenburg" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Instagram
            </a>
          </div>
          
          <div className="flex gap-4 text-sm">
            <a 
              href="/auth"
              className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
            >
              🔐 Admin Anmelden
            </a>
            {user && (
              <button 
                onClick={() => signOut()}
                className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
              >
                🚪 Abmelden
              </button>
            )}
          </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
          © 2024 Spendenlauf Lüneburg - Magnus Zastrow
        </div>
      </div>
    </footer>
  );
};

export default Footer;