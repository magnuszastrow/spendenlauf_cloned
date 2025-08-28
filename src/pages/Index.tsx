import HeroBanner from "@/components/HeroBanner";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, isAdmin } = useAuth();
  
  return (
    <Layout>
      <HeroBanner />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Willkommen zum Lüneburger Spendenlauf</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Laufen Sie mit uns für einen guten Zweck! Melden Sie sich jetzt an.
            </p>
            <div className="space-x-4">
              <Link to="/anmeldung">
                <Button size="lg">Jetzt anmelden</Button>
              </Link>
              <Link to="/info">
                <Button variant="outline" size="lg">Mehr Info</Button>
              </Link>
            </div>
          </div>

          {user && isAdmin && (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Administrator</CardTitle>
                <CardDescription>
                  Sie sind als Administrator angemeldet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/admin">
                  <Button className="w-full">Zum Admin Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;