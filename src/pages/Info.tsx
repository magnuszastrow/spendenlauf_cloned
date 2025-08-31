import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Info = () => {
  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Willkommen zum Lüneburger Spendenlauf</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Laufen Sie mit uns für einen guten Zweck! Melden Sie sich jetzt an.
            </p>
            <div className="space-x-4">
              <Link to="/anmeldung">
                <Button variant="hero" size="lg">Jetzt anmelden</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Info;