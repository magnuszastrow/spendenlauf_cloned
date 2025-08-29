import { useEffect, useState } from "react";
import heroImage from "@/assets/Titelbild_cropped.JPEG";

const HeroBanner = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="header relative flex items-center justify-center h-[clamp(400px,50vh,600px)] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundPosition: 'center 20%',
          transform: `translateY(${scrollY * 0.5}px)`,
          backgroundAttachment: 'fixed',
          scale: '1.1'
        }}
      />
      <div className="absolute inset-0 bg-black/50"></div>
      {/* Hero Text */}
      <div className="relative z-10 text-center text-white animate-fade-in">
        <h1 className="text-4xl font-bold uppercase tracking-wider md:text-6xl lg:text-7xl">
          <span className="text-highlight">LÜNEBURGER</span> <span>SPENDENLAUF</span>
        </h1>
        <p className="mt-4 text-2xl md:text-3xl lg:text-5xl">
          <span>Gemeinsam</span> <span className="text-highlight">für Kinder</span>
        </p>
      </div>
    </header>
  );
};

export default HeroBanner;