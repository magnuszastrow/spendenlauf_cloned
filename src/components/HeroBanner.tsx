const HeroBanner = () => {
  return (
    <header className="header relative flex items-center justify-center h-[clamp(150px,30vw,300px)] bg-cover bg-center bg-no-repeat">
      <div className="absolute inset-0 bg-black/60"></div>
      {/* Hero Text */}
      <div className="relative z-10 text-center text-white">
        <h1 className="text-3xl font-bold uppercase tracking-wider md:text-5xl">
          <span className="text-highlight">LÜNEBURGER</span> <span>SPENDENLAUF</span>
        </h1>
        <p className="mt-3 text-xl md:text-4xl">
          <span>Gemeinsam</span> <span className="text-highlight">für Kinder</span>
        </p>
      </div>
    </header>
  );
};

export default HeroBanner;