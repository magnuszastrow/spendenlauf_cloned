import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  age: number;
  gender: string;
  participant_type: string;
  runner_number: number;
  created_at: string;
}

interface Team {
  id: string;
  name: string;
  readable_team_id: string;
  team_email: string;
  shared_email: boolean;
  created_at: string;
}

interface Guardian {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    setDataLoading(true);
    try {
      const [participantsRes, teamsRes, guardiansRes] = await Promise.all([
        supabase.from('participants').select('*').order('created_at', { ascending: false }),
        supabase.from('teams').select('*').order('created_at', { ascending: false }),
        supabase.from('guardians').select('*').order('created_at', { ascending: false })
      ]);

      if (participantsRes.error) throw participantsRes.error;
      if (teamsRes.error) throw teamsRes.error;
      if (guardiansRes.error) throw guardiansRes.error;

      setParticipants(participantsRes.data || []);
      setTeams(teamsRes.data || []);
      setGuardians(guardiansRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setDataLoading(false);
    }
  };

  const exportData = (data: any[], filename: string) => {
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <Layout><div className="container mx-auto p-8">Laden...</div></Layout>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto p-8">
          <Card>
            <CardHeader>
              <CardTitle>Zugriff verweigert</CardTitle>
              <CardDescription>
                Sie haben keine Berechtigung, auf diese Seite zuzugreifen.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>
              Verwaltung der Event-Registrierungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="participants" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="participants">
                  Teilnehmer ({participants.length})
                </TabsTrigger>
                <TabsTrigger value="teams">
                  Teams ({teams.length})
                </TabsTrigger>
                <TabsTrigger value="guardians">
                  Erziehungsberechtigte ({guardians.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="participants" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Teilnehmer</h3>
                  <Button 
                    onClick={() => exportData(participants, 'teilnehmer')}
                    disabled={participants.length === 0}
                  >
                    CSV Export
                  </Button>
                </div>
                {dataLoading ? (
                  <div>Laden...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-2 text-left">Startnummer</th>
                          <th className="border border-gray-300 p-2 text-left">Name</th>
                          <th className="border border-gray-300 p-2 text-left">E-Mail</th>
                          <th className="border border-gray-300 p-2 text-left">Alter</th>
                          <th className="border border-gray-300 p-2 text-left">Geschlecht</th>
                          <th className="border border-gray-300 p-2 text-left">Typ</th>
                          <th className="border border-gray-300 p-2 text-left">Angemeldet</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map((participant) => (
                          <tr key={participant.id}>
                            <td className="border border-gray-300 p-2">{participant.runner_number}</td>
                            <td className="border border-gray-300 p-2">
                              {participant.first_name} {participant.last_name}
                            </td>
                            <td className="border border-gray-300 p-2">{participant.email}</td>
                            <td className="border border-gray-300 p-2">{participant.age}</td>
                            <td className="border border-gray-300 p-2">{participant.gender}</td>
                            <td className="border border-gray-300 p-2">{participant.participant_type}</td>
                            <td className="border border-gray-300 p-2">
                              {new Date(participant.created_at).toLocaleString('de-DE')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="teams" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Teams</h3>
                  <Button 
                    onClick={() => exportData(teams, 'teams')}
                    disabled={teams.length === 0}
                  >
                    CSV Export
                  </Button>
                </div>
                {dataLoading ? (
                  <div>Laden...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-2 text-left">Team-ID</th>
                          <th className="border border-gray-300 p-2 text-left">Name</th>
                          <th className="border border-gray-300 p-2 text-left">E-Mail</th>
                          <th className="border border-gray-300 p-2 text-left">Gemeinsame E-Mail</th>
                          <th className="border border-gray-300 p-2 text-left">Erstellt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teams.map((team) => (
                          <tr key={team.id}>
                            <td className="border border-gray-300 p-2">{team.readable_team_id}</td>
                            <td className="border border-gray-300 p-2">{team.name}</td>
                            <td className="border border-gray-300 p-2">{team.team_email}</td>
                            <td className="border border-gray-300 p-2">{team.shared_email ? 'Ja' : 'Nein'}</td>
                            <td className="border border-gray-300 p-2">
                              {new Date(team.created_at).toLocaleString('de-DE')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="guardians" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Erziehungsberechtigte</h3>
                  <Button 
                    onClick={() => exportData(guardians, 'erziehungsberechtigte')}
                    disabled={guardians.length === 0}
                  >
                    CSV Export
                  </Button>
                </div>
                {dataLoading ? (
                  <div>Laden...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-2 text-left">Name</th>
                          <th className="border border-gray-300 p-2 text-left">E-Mail</th>
                          <th className="border border-gray-300 p-2 text-left">Telefon</th>
                          <th className="border border-gray-300 p-2 text-left">Adresse</th>
                          <th className="border border-gray-300 p-2 text-left">Erstellt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {guardians.map((guardian) => (
                          <tr key={guardian.id}>
                            <td className="border border-gray-300 p-2">
                              {guardian.first_name} {guardian.last_name}
                            </td>
                            <td className="border border-gray-300 p-2">{guardian.email}</td>
                            <td className="border border-gray-300 p-2">{guardian.phone}</td>
                            <td className="border border-gray-300 p-2">{guardian.address}</td>
                            <td className="border border-gray-300 p-2">
                              {new Date(guardian.created_at).toLocaleString('de-DE')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Admin;