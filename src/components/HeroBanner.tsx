import { useIsMobile } from "@/hooks/use-mobile";
import MobileHeroBanner from "./MobileHeroBanner";
import DesktopHeroBanner from "./DesktopHeroBanner";

const HeroBanner = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileHeroBanner />;
  }

  return <DesktopHeroBanner />;
};

export default HeroBanner;