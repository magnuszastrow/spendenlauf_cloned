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

  // Keep parallax subtle and never expose edges
  const parallaxY = Math.min(scrollY * 0.35, isMobile ? 30 : 60);

  const imgStyle = isMobile
    ? {
        objectPosition: "center top",        // show from the very top
        transform: `translateY(${parallaxY}px) scale(1.25)`, // extra scale so it always covers
        transformOrigin: "center top",
      }
    : {
        objectPosition: "center 20%",
        transform: `translateY(${parallaxY}px) scale(1.1)`,
        transformOrigin: "center center",
      };

  return (
    <header
      className={
        // Smaller hero on mobile so the visible area aligns with the top ~2/3 of the photo
        "header relative flex items-center justify-center " +
        "h-[clamp(220px,32vh,300px)] md:h-[clamp(400px,50vh,600px)] " +
        "overflow-hidden"
      }
    >
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={heroImage}
          alt="Lüneburger Spendenlauf Hero"
          className="absolute inset-0 w-full h-full object-cover"
          style={imgStyle}
        />
      </div>

      <div className="absolute inset-0 bg-black/50" />

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
