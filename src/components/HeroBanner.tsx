import { useEffect, useState } from "react";
import heroImage from "@/assets/titelbild.jpg";

const HeroBanner = () => {
  const [scrollY, setScrollY] = useState(0);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

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

  const isMobile = windowWidth < 768;

  // Mobile: show exact top 2/3, fill banner
  const mobileStyle = {
    objectPosition: "center top",
    // scale to 150% so 2/3 of the image height == container height
    transform: `translateY(${scrollY * 0.5}px) scale(1.5)`,
    clipPath: "inset(0 0 33% 0)", // hide bottom third
  };

  // Desktop: your previous look
  const desktopStyle = {
    objectPosition: "center 20%",
    transform: `translateY(${scrollY * 0.5}px) scale(1.1)`,
    clipPath: "none",
  };

  return (
    <header className="header relative flex items-center justify-center h-[clamp(300px,33vh,400px)] md:h-[clamp(400px,50vh,600px)] overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={heroImage}
          alt="Lüneburger Spendenlauf Hero"
          className="absolute inset-0 w-full h-full object-cover"
          style={isMobile ? mobileStyle : desktopStyle}
        />
      </div>

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
