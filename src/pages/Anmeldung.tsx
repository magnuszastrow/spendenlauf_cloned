import { useEffect } from "react";
import { CharityRunSignup } from "@/components/CharityRunSignup";
import Layout from "@/components/Layout";
import { toast } from "@/hooks/use-toast";

const Anmeldung = () => {
  useEffect(() => {
    toast({
      title: "Anmeldung jetzt neu gestaltet",
      description: "Alle bisherigen Anmeldungen wurden übertragen",
      duration: 5000,
    });
  }, []);

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl mx-auto">
          <CharityRunSignup />
        </div>
      </div>
    </Layout>
  );
};

export default Anmeldung;