import HeroBanner from "@/components/HeroBanner";
import { CharityRunSignup } from "@/components/CharityRunSignup";

const Anmeldung = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroBanner />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl mx-auto">
          <CharityRunSignup />
        </div>
      </main>
    </div>
  );
};

export default Anmeldung;