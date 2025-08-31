import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent mb-2">
                Event-Verwaltung
              </h1>
              <p className="text-white/70 text-sm">
                Melden Sie sich an, um auf die Verwaltungsfunktionen zuzugreifen
              </p>
            </div>
            
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/10 border border-white/20">
                <TabsTrigger value="signin" className="text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white">Anmelden</TabsTrigger>
                <TabsTrigger value="signup" className="text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white">Registrieren</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-white/90">E-Mail</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-white/90">Passwort</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30" 
                    disabled={loading}
                  >
                    {loading ? 'Anmelden...' : 'Anmelden'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white/90">E-Mail</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white/90">Passwort</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                    />
                    <p className="text-sm text-white/60">
                      Mindestens 6 Zeichen
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30" 
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
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Zurück zur Startseite
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;