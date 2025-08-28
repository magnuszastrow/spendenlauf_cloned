import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Info from "./pages/Info";
import Anmeldung from "./pages/Anmeldung";
import Sponsoren from "./pages/Sponsoren";
import FAQs from "./pages/FAQs";
import Kontakt from "./pages/Kontakt";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/info" element={<Info />} />
          <Route path="/anmeldung" element={<Anmeldung />} />
          <Route path="/sponsoren" element={<Sponsoren />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/kontakt" element={<Kontakt />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
