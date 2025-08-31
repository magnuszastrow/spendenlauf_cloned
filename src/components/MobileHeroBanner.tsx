import heroImage from "@/assets/titelbild.jpg";

const MobileHeroBanner = () => {
  return (
    <header className="header relative flex items-center justify-center h-[clamp(300px,33vh,400px)] overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src={heroImage}
          alt="Lüneburger Spendenlauf Hero"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectPosition: 'center top',
            transform: 'scale(1.05)',
            transformOrigin: 'center top'
          }}
        />
      </div>
      <div className="absolute inset-0 bg-black/50"></div>
      {/* Hero Text */}
      <div className="relative z-10 text-center text-white animate-fade-in">
        <h1 className="text-4xl font-bold uppercase tracking-wider">
          <span className="text-highlight">LÜNEBURGER</span> <span>SPENDENLAUF</span>
        </h1>
        <p className="mt-4 text-2xl">
          <span>Gemeinsam</span> <span className="text-highlight">für Kinder</span>
        </p>
      </div>
    </header>
  );
};

export default MobileHeroBanner;