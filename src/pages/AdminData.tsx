import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Trash2, Edit2, Plus, Save, X } from "lucide-react";
import { Navigate } from "react-router-dom";

interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  gender?: string;
  email?: string;
  participant_type: string;
  runner_number?: number;
  event_id: string;
  team_id?: string;
  guardian_id?: string;
  timeslot_id?: string;
  created_at: string;
}

interface Event {
  id: string;
  name: string;
  description?: string;
  date?: string;
  year: number;
  registration_open: boolean;
  created_at: string;
}

interface Timeslot {
  id: string;
  name: string;
  time: string;
  max_participants: number;
  event_id: string;
  created_at: string;
}

const AdminData = () => {
  const { user, isAdmin } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("participants");

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [participantsRes, eventsRes, timeslotsRes] = await Promise.all([
        supabase.from('participants').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('*').order('created_at', { ascending: false }),
        supabase.from('timeslots').select('*').order('created_at', { ascending: false })
      ]);

      if (participantsRes.error) throw participantsRes.error;
      if (eventsRes.error) throw eventsRes.error;
      if (timeslotsRes.error) throw timeslotsRes.error;

      setParticipants(participantsRes.data || []);
      setEvents(eventsRes.data || []);
      setTimeslots(timeslotsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Fehler",
        description: "Daten konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (table: 'participants' | 'events' | 'timeslots', data: any) => {
    try {
      if (data.id && !isCreating) {
        // Update existing record
        const { error } = await supabase
          .from(table)
          .update(data)
          .eq('id', data.id);
        
        if (error) throw error;
        toast({ title: "Erfolgreich", description: "Daten wurden aktualisiert." });
      } else {
        // Create new record
        const { id, ...insertData } = data;
        const { error } = await supabase
          .from(table)
          .insert(insertData);
        
        if (error) throw error;
        toast({ title: "Erfolgreich", description: "Neuer Eintrag wurde erstellt." });
      }
      
      setEditingItem(null);
      setIsCreating(false);
      loadData();
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: "Fehler",
        description: "Daten konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (table: 'participants' | 'events' | 'timeslots', id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?')) return;
    
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: "Erfolgreich", description: "Eintrag wurde gelöscht." });
      loadData();
    } catch (error) {
      console.error('Error deleting data:', error);
      toast({
        title: "Fehler",
        description: "Eintrag konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const renderParticipantsTable = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Teilnehmer ({participants.length})</h3>
        <Button 
          onClick={() => {
            setIsCreating(true);
            setEditingItem({
              first_name: '',
              last_name: '',
              age: '',
              gender: '',
              email: '',
              participant_type: '',
              event_id: events[0]?.id || ''
            });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Neuer Teilnehmer
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border p-2 text-left">Name</th>
              <th className="border border-border p-2 text-left">Alter</th>
              <th className="border border-border p-2 text-left">Typ</th>
              <th className="border border-border p-2 text-left">Läufer-Nr.</th>
              <th className="border border-border p-2 text-left">Email</th>
              <th className="border border-border p-2 text-left">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant) => (
              <tr key={participant.id} className="hover:bg-muted/50">
                {editingItem?.id === participant.id ? (
                  <ParticipantEditRow 
                    participant={editingItem}
                    events={events}
                    onSave={(data) => handleSave('participants', data)}
                    onCancel={() => setEditingItem(null)}
                    onChange={setEditingItem}
                  />
                ) : (
                  <>
                    <td className="border border-border p-2">
                      {participant.first_name} {participant.last_name}
                    </td>
                    <td className="border border-border p-2">{participant.age}</td>
                    <td className="border border-border p-2">{participant.participant_type}</td>
                    <td className="border border-border p-2">{participant.runner_number || '-'}</td>
                    <td className="border border-border p-2">{participant.email || '-'}</td>
                    <td className="border border-border p-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingItem(participant)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete('participants', participant.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {isCreating && activeTab === 'participants' && (
              <ParticipantEditRow 
                participant={editingItem}
                events={events}
                onSave={(data) => handleSave('participants', data)}
                onCancel={() => {
                  setEditingItem(null);
                  setIsCreating(false);
                }}
                onChange={setEditingItem}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEventsTable = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Events ({events.length})</h3>
        <Button 
          onClick={() => {
            setIsCreating(true);
            setEditingItem({
              name: '',
              description: '',
              date: '',
              year: new Date().getFullYear(),
              registration_open: true
            });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Neues Event
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border p-2 text-left">Name</th>
              <th className="border border-border p-2 text-left">Jahr</th>
              <th className="border border-border p-2 text-left">Datum</th>
              <th className="border border-border p-2 text-left">Anmeldung offen</th>
              <th className="border border-border p-2 text-left">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-muted/50">
                {editingItem?.id === event.id ? (
                  <EventEditRow 
                    event={editingItem}
                    onSave={(data) => handleSave('events', data)}
                    onCancel={() => setEditingItem(null)}
                    onChange={setEditingItem}
                  />
                ) : (
                  <>
                    <td className="border border-border p-2">{event.name}</td>
                    <td className="border border-border p-2">{event.year}</td>
                    <td className="border border-border p-2">{event.date || '-'}</td>
                    <td className="border border-border p-2">
                      {event.registration_open ? 'Ja' : 'Nein'}
                    </td>
                    <td className="border border-border p-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingItem(event)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete('events', event.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {isCreating && activeTab === 'events' && (
              <EventEditRow 
                event={editingItem}
                onSave={(data) => handleSave('events', data)}
                onCancel={() => {
                  setEditingItem(null);
                  setIsCreating(false);
                }}
                onChange={setEditingItem}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTimeslotsTable = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Zeitslots ({timeslots.length})</h3>
        <Button 
          onClick={() => {
            setIsCreating(true);
            setEditingItem({
              name: '',
              time: '',
              max_participants: 50,
              event_id: events[0]?.id || ''
            });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Neuer Zeitslot
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border p-2 text-left">Name</th>
              <th className="border border-border p-2 text-left">Zeit</th>
              <th className="border border-border p-2 text-left">Max Teilnehmer</th>
              <th className="border border-border p-2 text-left">Event</th>
              <th className="border border-border p-2 text-left">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {timeslots.map((timeslot) => (
              <tr key={timeslot.id} className="hover:bg-muted/50">
                {editingItem?.id === timeslot.id ? (
                  <TimeslotEditRow 
                    timeslot={editingItem}
                    events={events}
                    onSave={(data) => handleSave('timeslots', data)}
                    onCancel={() => setEditingItem(null)}
                    onChange={setEditingItem}
                  />
                ) : (
                  <>
                    <td className="border border-border p-2">{timeslot.name}</td>
                    <td className="border border-border p-2">{timeslot.time}</td>
                    <td className="border border-border p-2">{timeslot.max_participants}</td>
                    <td className="border border-border p-2">
                      {events.find(e => e.id === timeslot.event_id)?.name || '-'}
                    </td>
                    <td className="border border-border p-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingItem(timeslot)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete('timeslots', timeslot.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {isCreating && activeTab === 'timeslots' && (
              <TimeslotEditRow 
                timeslot={editingItem}
                events={events}
                onSave={(data) => handleSave('timeslots', data)}
                onCancel={() => {
                  setEditingItem(null);
                  setIsCreating(false);
                }}
                onChange={setEditingItem}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Lade Daten...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Datenverwaltung</CardTitle>
            <CardDescription>
              Verwalten Sie Teilnehmer, Events und Zeitslots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="participants">Teilnehmer</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="timeslots">Zeitslots</TabsTrigger>
              </TabsList>
              
              <TabsContent value="participants" className="mt-6">
                {renderParticipantsTable()}
              </TabsContent>
              
              <TabsContent value="events" className="mt-6">
                {renderEventsTable()}
              </TabsContent>
              
              <TabsContent value="timeslots" className="mt-6">
                {renderTimeslotsTable()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

// Edit row components
const ParticipantEditRow = ({ participant, events, onSave, onCancel, onChange }: any) => (
  <>
    <td className="border border-border p-2">
      <div className="flex gap-2">
        <Input
          value={participant.first_name}
          onChange={(e) => onChange({...participant, first_name: e.target.value})}
          placeholder="Vorname"
          className="text-sm"
        />
        <Input
          value={participant.last_name}
          onChange={(e) => onChange({...participant, last_name: e.target.value})}
          placeholder="Nachname"
          className="text-sm"
        />
      </div>
    </td>
    <td className="border border-border p-2">
      <Input
        type="number"
        value={participant.age}
        onChange={(e) => onChange({...participant, age: parseInt(e.target.value)})}
        className="text-sm"
      />
    </td>
    <td className="border border-border p-2">
      <select
        value={participant.participant_type}
        onChange={(e) => onChange({...participant, participant_type: e.target.value})}
        className="w-full p-1 border rounded text-sm bg-background"
      >
        <option value="">Typ wählen</option>
        <option value="child">Kind</option>
        <option value="adult">Erwachsener</option>
      </select>
    </td>
    <td className="border border-border p-2">
      <Input
        type="number"
        value={participant.runner_number || ''}
        onChange={(e) => onChange({...participant, runner_number: e.target.value ? parseInt(e.target.value) : null})}
        placeholder="Läufer-Nr."
        className="text-sm"
      />
    </td>
    <td className="border border-border p-2">
      <Input
        value={participant.email || ''}
        onChange={(e) => onChange({...participant, email: e.target.value})}
        placeholder="Email"
        className="text-sm"
      />
    </td>
    <td className="border border-border p-2">
      <div className="flex gap-1">
        <Button size="sm" onClick={() => onSave(participant)}>
          <Save className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X className="w-3 h-3" />
        </Button>
      </div>
    </td>
  </>
);

const EventEditRow = ({ event, onSave, onCancel, onChange }: any) => (
  <>
    <td className="border border-border p-2">
      <Input
        value={event.name}
        onChange={(e) => onChange({...event, name: e.target.value})}
        placeholder="Event Name"
        className="text-sm"
      />
    </td>
    <td className="border border-border p-2">
      <Input
        type="number"
        value={event.year}
        onChange={(e) => onChange({...event, year: parseInt(e.target.value)})}
        className="text-sm"
      />
    </td>
    <td className="border border-border p-2">
      <Input
        type="date"
        value={event.date || ''}
        onChange={(e) => onChange({...event, date: e.target.value})}
        className="text-sm"
      />
    </td>
    <td className="border border-border p-2">
      <input
        type="checkbox"
        checked={event.registration_open}
        onChange={(e) => onChange({...event, registration_open: e.target.checked})}
        className="w-4 h-4"
      />
    </td>
    <td className="border border-border p-2">
      <div className="flex gap-1">
        <Button size="sm" onClick={() => onSave(event)}>
          <Save className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X className="w-3 h-3" />
        </Button>
      </div>
    </td>
  </>
);

const TimeslotEditRow = ({ timeslot, events, onSave, onCancel, onChange }: any) => (
  <>
    <td className="border border-border p-2">
      <Input
        value={timeslot.name}
        onChange={(e) => onChange({...timeslot, name: e.target.value})}
        placeholder="Zeitslot Name"
        className="text-sm"
      />
    </td>
    <td className="border border-border p-2">
      <Input
        type="time"
        value={timeslot.time}
        onChange={(e) => onChange({...timeslot, time: e.target.value})}
        className="text-sm"
      />
    </td>
    <td className="border border-border p-2">
      <Input
        type="number"
        value={timeslot.max_participants}
        onChange={(e) => onChange({...timeslot, max_participants: parseInt(e.target.value)})}
        className="text-sm"
        min="1"
      />
    </td>
    <td className="border border-border p-2">
      <select
        value={timeslot.event_id}
        onChange={(e) => onChange({...timeslot, event_id: e.target.value})}
        className="w-full p-1 border rounded text-sm bg-background"
      >
        <option value="">Event wählen</option>
        {events.map((event: Event) => (
          <option key={event.id} value={event.id}>{event.name}</option>
        ))}
      </select>
    </td>
    <td className="border border-border p-2">
      <div className="flex gap-1">
        <Button size="sm" onClick={() => onSave(timeslot)}>
          <Save className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X className="w-3 h-3" />
        </Button>
      </div>
    </td>
  </>
);

export default AdminData;