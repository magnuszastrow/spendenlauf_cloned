import { useEffect, useState } from "react";
import heroImage from "@/assets/titelbild.jpg";

const HeroBanner = () => {
  const [scrollY, setScrollY] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleResize = () => setWindowWidth(window.innerWidth);
    
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <header className="header relative flex items-center justify-center h-[clamp(400px,50vh,600px)] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundPosition: windowWidth < 768 ? 'center 15%' : 'center 20%',
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