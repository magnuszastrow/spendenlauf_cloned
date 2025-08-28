import { CharityRunSignup } from "@/components/CharityRunSignup";
import Layout from "@/components/Layout";

const Anmeldung = () => {
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