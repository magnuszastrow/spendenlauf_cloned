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
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Willkommen zum Lüneburger Spendenlauf</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Laufen Sie mit uns für einen guten Zweck! Melden Sie sich jetzt an.
            </p>
            <div className="space-x-4">
              <Link to="/info">
                <Button variant="outline" size="lg">Mehr Info</Button>
              </Link>
            </div>
          </div>

          {user && isAdmin && (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>
                  Verwalten Sie alle Spendenlauf-Daten
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/admin/dashboard">
                  <Button className="w-full" variant="default">
                    📊 Dashboard
                  </Button>
                </Link>
                <Link to="/admin/data">
                  <Button className="w-full" variant="outline">
                    🗂️ Datenverwaltung
                  </Button>
                </Link>
                <Link to="/admin">
                  <Button className="w-full" variant="outline">
                    📋 Export (Alt)
                  </Button>
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