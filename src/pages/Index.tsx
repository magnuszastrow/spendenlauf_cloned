import { CharityRunSignup } from "@/components/CharityRunSignup";
import heroImage from "@/assets/charity-run-hero.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Charity Run Event"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/70" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-primary-foreground">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Charity Run 2024
            </h1>
            <p className="text-xl md:text-2xl opacity-90">
              Laufen für den guten Zweck
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <CharityRunSignup />
      </div>

      {/* Info Section */}
      <div className="bg-gradient-card py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl text-primary-foreground font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold">Anmelden</h3>
              <p className="text-muted-foreground">
                Wählen Sie zwischen Einzelanmeldung, Team oder Kinderlauf
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl text-primary-foreground font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold">Laufen</h3>
              <p className="text-muted-foreground">
                Nehmen Sie am Event teil und laufen Sie für den guten Zweck
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl text-primary-foreground font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold">Helfen</h3>
              <p className="text-muted-foreground">
                Ihre Teilnahme unterstützt lokale Wohltätigkeitsorganisationen
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;