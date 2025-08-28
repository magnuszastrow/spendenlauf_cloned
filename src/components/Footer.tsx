import { useAuth } from "@/contexts/AuthContext";

const Footer = () => {
  const { user, signOut } = useAuth();
  return (
    <footer className="bg-gray-100 p-4 text-center">
      <hr className="border-gray-300 mx-2 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Kontakt</h2>
      <p className="mb-2">Magnus Zastrow</p>
      <p className="mb-2">
        <span className="mr-2">✉️</span>
        <a 
          href="mailto:spendenlauf.lueneburg@gmail.com"
          className="text-inherit hover:underline"
        >
          spendenlauf.lueneburg@gmail.com
        </a>
      </p>
      <p className="mb-4">
        <span className="mr-2">📞</span>
        <a 
          href="tel:+4917636387811"
          className="text-inherit hover:underline"
        >
          0176 363 878 11
        </a>
      </p>
      <div className="pt-4 border-t border-gray-300 flex justify-center gap-4">
        <a 
          href="/auth"
          className="inline-flex items-center text-sm text-gray-600 hover:text-primary transition-colors"
        >
          🔐 Admin Anmelden
        </a>
        {user && (
          <button 
            onClick={() => signOut()}
            className="inline-flex items-center text-sm text-gray-600 hover:text-primary transition-colors"
          >
            🚪 Abmelden
          </button>
        )}
      </div>
    </footer>
  );
};

export default Footer;