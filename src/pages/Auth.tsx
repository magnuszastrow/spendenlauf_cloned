import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated - use useEffect to avoid render-time navigation
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Ungültige Anmeldedaten. Bitte überprüfen Sie E-Mail und Passwort.');
        } else {
          toast.error('Anmeldung fehlgeschlagen: ' + error.message);
        }
      } else {
        toast.success('Erfolgreich angemeldet!');
        // Navigation will be handled by the useEffect above when user state updates
      }
    } catch (error) {
      toast.error('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.');
        } else if (error.message.includes('Password should be at least')) {
          toast.error('Das Passwort muss mindestens 6 Zeichen lang sein.');
        } else {
          toast.error('Registrierung fehlgeschlagen: ' + error.message);
        }
      } else {
        toast.success('Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mails zur Bestätigung.');
      }
    } catch (error) {
      toast.error('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Event-Verwaltung</CardTitle>
              <CardDescription>
                Melden Sie sich an, um auf die Verwaltungsfunktionen zuzugreifen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Anmelden</TabsTrigger>
                  <TabsTrigger value="signup">Registrieren</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">E-Mail</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Passwort</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? 'Anmelden...' : 'Anmelden'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">E-Mail</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Passwort</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                      />
                      <p className="text-sm text-muted-foreground">
                        Mindestens 6 Zeichen
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? 'Registrieren...' : 'Registrieren'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 text-center">
                <Link 
                  to="/" 
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Zurück zur Startseite
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;