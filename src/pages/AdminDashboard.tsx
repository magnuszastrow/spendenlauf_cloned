import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Navigate } from "react-router-dom";
import { Users, Calendar, Clock, TrendingUp } from "lucide-react";

interface DashboardStats {
  totalParticipants: number;
  totalEvents: number;
  totalTimeslots: number;
  participantsByType: { [key: string]: number };
  timeslotFillRates: Array<{
    id: string;
    name: string;
    time: string;
    current: number;
    max: number;
    percentage: number;
  }>;
  recentParticipants: Array<{
    id: string;
    first_name: string;
    last_name: string;
    participant_type: string;
    created_at: string;
  }>;
}

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalParticipants: 0,
    totalEvents: 0,
    totalTimeslots: 0,
    participantsByType: {},
    timeslotFillRates: [],
    recentParticipants: []
  });
  const [loading, setLoading] = useState(true);

  console.log('AdminDashboard render:', { user: !!user, isAdmin, authLoading });

  // Show loading while auth is loading
  if (authLoading) {
    console.log('Auth loading...');
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Lade Authentifizierung...</div>
          </div>
        </div>
      </Layout>
    );
  }

  // Redirect if not admin
  if (!user || !isAdmin) {
    console.log('Redirecting to auth - user:', !!user, 'isAdmin:', isAdmin);
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      console.log('Loading dashboard data...');
      
      // Load participants
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Participants loaded:', participants, participantsError);
      if (participantsError) throw participantsError;

      // Load events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*');

      console.log('Events loaded:', events, eventsError);
      if (eventsError) throw eventsError;

      // Load timeslots with participant counts
      const { data: timeslots, error: timeslotsError } = await supabase
        .from('timeslots')
        .select('*');

      console.log('Timeslots loaded:', timeslots, timeslotsError);
      if (timeslotsError) throw timeslotsError;

      // Process data
      const participantsByType = participants?.reduce((acc: any, p) => {
        acc[p.participant_type] = (acc[p.participant_type] || 0) + 1;
        return acc;
      }, {}) || {};

      console.log('Participants by type:', participantsByType);

      // Calculate timeslot fill rates
      const timeslotFillRates = await Promise.all(
        timeslots?.map(async (slot) => {
          const { count: participantCount } = await supabase
            .from('participants')
            .select('*', { count: 'exact', head: true })
            .eq('timeslot_id', slot.id);

          const current = participantCount || 0;
          const max = slot.max_participants || 1; // Prevent division by zero
          
          return {
            id: slot.id,
            name: slot.name,
            time: slot.time,
            current,
            max,
            percentage: (current / max) * 100
          };
        }) || []
      );

      console.log('Timeslot fill rates:', timeslotFillRates);

      setStats({
        totalParticipants: participants?.length || 0,
        totalEvents: events?.length || 0,
        totalTimeslots: timeslots?.length || 0,
        participantsByType,
        timeslotFillRates,
        recentParticipants: participants?.slice(0, 5) || []
      });
      
      console.log('Dashboard stats set successfully');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 70) return "bg-orange-500";
    return "bg-primary";
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Lade Dashboard...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Überblick über alle Spendenlauf-Daten
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Gesamt Teilnehmer
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalParticipants}</div>
                <p className="text-xs text-muted-foreground">
                  Registrierte Läufer
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Events
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Geplante Veranstaltungen
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Zeitslots
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTimeslots}</div>
                <p className="text-xs text-muted-foreground">
                  Verfügbare Startzeiten
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Auslastung
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.timeslotFillRates.length > 0 
                    ? Math.round(stats.timeslotFillRates.reduce((acc, slot) => acc + slot.percentage, 0) / stats.timeslotFillRates.length)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Durchschnittliche Auslastung
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Timeslot Fill Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Zeitslot Auslastung</CardTitle>
                <CardDescription>
                  Wie voll sind die einzelnen Startzeiten?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.timeslotFillRates.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Keine Zeitslots verfügbar
                  </p>
                ) : (
                  stats.timeslotFillRates.map((slot) => (
                    <div key={slot.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{slot.name}</p>
                          <p className="text-sm text-muted-foreground">{slot.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{slot.current}/{slot.max}</p>
                          <Badge 
                            variant={slot.percentage >= 90 ? "destructive" : 
                                   slot.percentage >= 70 ? "secondary" : "default"}
                          >
                            {Math.round(slot.percentage)}%
                          </Badge>
                        </div>
                      </div>
                      <Progress 
                        value={slot.percentage} 
                        className="h-2"
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Participant Types */}
            <Card>
              <CardHeader>
                <CardTitle>Teilnehmer nach Typ</CardTitle>
                <CardDescription>
                  Verteilung der Teilnehmertypen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.keys(stats.participantsByType).length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Keine Teilnehmer registriert
                  </p>
                ) : (
                  Object.entries(stats.participantsByType).map(([type, count]) => (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-medium capitalize">
                          {type === 'child' ? 'Kinder' : 
                           type === 'adult' ? 'Erwachsene' : type}
                        </p>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                      <Progress 
                        value={(count / stats.totalParticipants) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Participants */}
          <Card>
            <CardHeader>
              <CardTitle>Neueste Anmeldungen</CardTitle>
              <CardDescription>
                Die letzten 5 registrierten Teilnehmer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentParticipants.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Keine neuen Anmeldungen
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.recentParticipants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {participant.first_name} {participant.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {participant.participant_type === 'child' ? 'Kind' : 
                           participant.participant_type === 'adult' ? 'Erwachsener' : 
                           participant.participant_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(participant.created_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;