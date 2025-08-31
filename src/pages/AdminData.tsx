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
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Trash2, Edit2, Plus, Save, X, ChevronDown, Calendar } from "lucide-react";
import { Navigate } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

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
  type: string;
  max_participants: number;
  event_id: string;
  created_at: string;
}

interface ConfirmDialogState {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
}

const AdminData = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("participants");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });
  const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    date: '',
    year: new Date().getFullYear(),
    registration_open: true
  });
  const [newTimeslots, setNewTimeslots] = useState<Array<{
    name: string;
    time: string;
    type: 'normal' | 'children';
    max_participants: number;
  }>>([
    { name: 'Hauptlauf', time: '10:00', type: 'normal' as const, max_participants: 50 }
  ]);

  console.log('AdminData render:', { user: !!user, isAdmin, authLoading });

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

  const loadEvents = async () => {
    try {
      console.log('Loading events...');
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('year', { ascending: false });

      console.log('Events loaded:', eventsData, eventsError);
      if (eventsError) throw eventsError;

      setEvents(eventsData || []);
      
      // Auto-select first event if none selected
      if (eventsData && eventsData.length > 0 && !selectedEvent) {
        setSelectedEvent(eventsData[0].id);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: "Fehler",
        description: "Events konnten nicht geladen werden.",
        variant: "destructive",
      });
    }
  };

  const loadEventData = async (eventId: string) => {
    if (!eventId) return;
    
    setLoading(true);
    try {
      console.log('Loading event data for:', eventId);
      
      const [participantsRes, timeslotsRes] = await Promise.all([
        supabase.from('participants').select('*').eq('event_id', eventId).order('created_at', { ascending: false }),
        supabase.from('timeslots').select('*').eq('event_id', eventId).order('created_at', { ascending: false })
      ]);

      if (participantsRes.error) throw participantsRes.error;
      if (timeslotsRes.error) throw timeslotsRes.error;

      setParticipants(participantsRes.data || []);
      setTimeslots(timeslotsRes.data || []);
      
      console.log('Event data loaded:', { 
        participants: participantsRes.data?.length, 
        timeslots: timeslotsRes.data?.length 
      });
    } catch (error) {
      console.error('Error loading event data:', error);
      toast({
        title: "Fehler",
        description: "Event-Daten konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load events on mount
  useEffect(() => {
    if (user && isAdmin && !authLoading) {
      loadEvents();
    }
  }, [user, isAdmin, authLoading]);

  // Load event data when selected event changes
  useEffect(() => {
    if (selectedEvent && user && isAdmin && !authLoading) {
      loadEventData(selectedEvent);
    }
  }, [selectedEvent, user, isAdmin, authLoading]);

  const handleSave = async (table: 'participants' | 'timeslots', data: any) => {
    const itemType = table === 'participants' ? 'Teilnehmer' : 'Zeitslot';
    const isUpdate = data.id && !isCreating;
    
    const confirmTitle = isUpdate ? `${itemType} bearbeiten` : `${itemType} erstellen`;
    const confirmDescription = isUpdate 
      ? `Möchten Sie die Änderungen an diesem ${itemType.toLowerCase()} speichern?\n\n${getItemDescription(table, data)}`
      : `Möchten Sie diesen ${itemType.toLowerCase()} erstellen?\n\n${getItemDescription(table, data)}`;

    setConfirmDialog({
      open: true,
      title: confirmTitle,
      description: confirmDescription,
      onConfirm: () => performSave(table, data),
    });
  };

  const performSave = async (table: 'participants' | 'timeslots', data: any) => {
    try {
      // Ensure event_id is set to selected event for new items
      if (!data.event_id && selectedEvent) {
        data.event_id = selectedEvent;
      }

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
      setConfirmDialog({ ...confirmDialog, open: false });
      if (selectedEvent) {
        loadEventData(selectedEvent);
      }
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: "Fehler",
        description: "Daten konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (table: 'participants' | 'timeslots', id: string, item: any) => {
    const itemType = table === 'participants' ? 'Teilnehmer' : 'Zeitslot';
    
    setConfirmDialog({
      open: true,
      title: `${itemType} löschen`,
      description: `Sind Sie sicher, dass Sie diesen ${itemType.toLowerCase()} löschen möchten?\n\n${getItemDescription(table, item)}\n\nDieser Vorgang kann nicht rückgängig gemacht werden.`,
      onConfirm: () => performDelete(table, id),
      variant: "destructive",
    });
  };

  const performDelete = async (table: 'participants' | 'timeslots', id: string) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: "Erfolgreich", description: "Eintrag wurde gelöscht." });
      setConfirmDialog({ ...confirmDialog, open: false });
      if (selectedEvent) {
        loadEventData(selectedEvent);
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      toast({
        title: "Fehler",
        description: "Eintrag konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const getItemDescription = (table: 'participants' | 'timeslots', item: any) => {
    if (table === 'participants') {
      return `Name: ${item.first_name} ${item.last_name}\nAlter: ${item.age}\nTyp: ${item.participant_type}\nEmail: ${item.email || 'Nicht angegeben'}`;
    } else {
      return `Name: ${item.name}\nZeit: ${item.time}\nTyp: ${item.type === 'children' ? 'Kinderlauf' : 'Hauptlauf'}\nMax. Teilnehmer: ${item.max_participants}`;
    }
  };

  const handleCreateEvent = async () => {
    try {
      if (!newEvent.name.trim()) {
        toast({
          title: "Fehler",
          description: "Bitte geben Sie einen Event-Namen ein.",
          variant: "destructive",
        });
        return;
      }

      if (newTimeslots.some(ts => !ts.name.trim() || !ts.time)) {
        toast({
          title: "Fehler", 
          description: "Bitte füllen Sie alle Zeitslot-Felder aus.",
          variant: "destructive",
        });
        return;
      }

      // Create event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          name: newEvent.name,
          description: newEvent.description,
          date: newEvent.date || null,
          year: newEvent.year,
          registration_open: newEvent.registration_open
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Create timeslots for the new event
      const timeslotInserts = newTimeslots.map(ts => ({
        ...ts,
        event_id: eventData.id
      }));

      const { error: timeslotError } = await supabase
        .from('timeslots')
        .insert(timeslotInserts);

      if (timeslotError) throw timeslotError;

      toast({
        title: "Erfolgreich",
        description: "Event wurde erstellt."
      });

      // Reset form and close dialog
      setNewEvent({
        name: '',
        description: '',
        date: '',
        year: new Date().getFullYear(),
        registration_open: true
      });
      setNewTimeslots([
        { name: 'Hauptlauf', time: '10:00', type: 'normal' as const, max_participants: 50 }
      ]);
      setShowCreateEventDialog(false);

      // Reload events and select the new one
      await loadEvents();
      setSelectedEvent(eventData.id);

    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Fehler",
        description: "Event konnte nicht erstellt werden.",
        variant: "destructive",
      });
    }
  };

  const renderLimitedTable = (data: any[], renderRow: (item: any) => React.ReactNode) => {
    const DISPLAY_LIMIT = 10;
    
    if (data.length <= DISPLAY_LIMIT) {
      return data.map(renderRow);
    }

    const firstPart = data.slice(0, 5);
    const lastPart = data.slice(-5);
    const hiddenCount = data.length - 10;

    return (
      <>
        {firstPart.map(renderRow)}
        <tr key="separator" className="bg-muted/30">
          <td colSpan={6} className="border border-border p-4 text-center text-muted-foreground">
            ... {hiddenCount} weitere Einträge ...
          </td>
        </tr>
        {lastPart.map(renderRow)}
      </>
    );
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
              event_id: selectedEvent || ''
            });
          }}
          disabled={!selectedEvent}
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
            {renderLimitedTable(participants, (participant) => (
              <tr key={participant.id} className="hover:bg-muted/50">
                {editingItem?.id === participant.id ? (
                  <ParticipantEditRow 
                    participant={editingItem}
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
                          onClick={() => handleDelete('participants', participant.id, participant)}
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
              type: 'normal',
              max_participants: 50,
              event_id: selectedEvent || ''
            });
          }}
          disabled={!selectedEvent}
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
              <th className="border border-border p-2 text-left">Typ</th>
              <th className="border border-border p-2 text-left">Max Teilnehmer</th>
              <th className="border border-border p-2 text-left">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {renderLimitedTable(timeslots, (timeslot) => (
              <tr key={timeslot.id} className="hover:bg-muted/50">
                {editingItem?.id === timeslot.id ? (
                  <TimeslotEditRow 
                    timeslot={editingItem}
                    onSave={(data) => handleSave('timeslots', data)}
                    onCancel={() => setEditingItem(null)}
                    onChange={setEditingItem}
                  />
                ) : (
                  <>
                    <td className="border border-border p-2">{timeslot.name}</td>
                    <td className="border border-border p-2">{timeslot.time}</td>
                    <td className="border border-border p-2">
                      {timeslot.type === 'children' ? 'Kinderlauf' : 'Hauptlauf'}
                    </td>
                    <td className="border border-border p-2">{timeslot.max_participants}</td>
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
                          onClick={() => handleDelete('timeslots', timeslot.id, timeslot)}
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Datenverwaltung</CardTitle>
                <CardDescription>
                  Verwalten Sie Teilnehmer und Zeitslots für ein Event
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Event:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="min-w-[200px] justify-between">
                      {selectedEvent ? 
                        events.find(e => e.id === selectedEvent)?.name || 'Event auswählen' : 
                        'Event auswählen'
                      }
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[200px] bg-background border z-50">
                    {events.map((event) => (
                      <DropdownMenuItem
                        key={event.id}
                        onClick={() => setSelectedEvent(event.id)}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{event.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {event.year} {event.date && `• ${new Date(event.date).toLocaleDateString('de-DE')}`}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!selectedEvent ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Bitte wählen Sie ein Event aus, um die Daten zu verwalten.</p>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="participants">Teilnehmer</TabsTrigger>
                  <TabsTrigger value="timeslots">Zeitslots</TabsTrigger>
                </TabsList>
                
                <TabsContent value="participants" className="mt-6">
                  {renderParticipantsTable()}
                </TabsContent>
                
                <TabsContent value="timeslots" className="mt-6">
                  {renderTimeslotsTable()}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {/* Add Event Button */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <Button
            onClick={() => setShowCreateEventDialog(true)}
            className="w-full sm:w-auto"
            variant="outline"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Neues Event erstellen
          </Button>
        </div>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={showCreateEventDialog} onOpenChange={setShowCreateEventDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neues Event erstellen</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Event Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Event Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event-name">Name *</Label>
                  <Input
                    id="event-name"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                    placeholder="Event Name"
                  />
                </div>
                <div>
                  <Label htmlFor="event-year">Jahr</Label>
                  <Input
                    id="event-year"
                    type="number"
                    value={newEvent.year}
                    onChange={(e) => setNewEvent({...newEvent, year: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="event-date">Datum</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="event-description">Beschreibung</Label>
                <Input
                  id="event-description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Event Beschreibung"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="registration-open"
                  checked={newEvent.registration_open}
                  onCheckedChange={(checked) => setNewEvent({...newEvent, registration_open: !!checked})}
                />
                <Label htmlFor="registration-open">Anmeldung geöffnet</Label>
              </div>
            </div>

            {/* Timeslots */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Zeitslots *</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewTimeslots([...newTimeslots, { name: '', time: '10:00', type: 'normal' as const, max_participants: 50 }])}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Zeitslot hinzufügen
                </Button>
              </div>
              
              {newTimeslots.map((timeslot, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Zeitslot {index + 1}</span>
                    {newTimeslots.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setNewTimeslots(newTimeslots.filter((_, i) => i !== index))}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={timeslot.name}
                        onChange={(e) => {
                          const updated = [...newTimeslots];
                          updated[index].name = e.target.value;
                          setNewTimeslots(updated);
                        }}
                        placeholder="Zeitslot Name"
                      />
                    </div>
                    <div>
                      <Label>Zeit</Label>
                      <Input
                        type="time"
                        value={timeslot.time}
                        onChange={(e) => {
                          const updated = [...newTimeslots];
                          updated[index].time = e.target.value;
                          setNewTimeslots(updated);
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label>Typ</Label>
                      <select
                        value={timeslot.type}
                        onChange={(e) => {
                          const updated = [...newTimeslots];
                          updated[index].type = e.target.value as 'normal' | 'children';
                          setNewTimeslots(updated);
                        }}
                        className="w-full p-2 border rounded bg-background"
                      >
                        <option value="normal">Hauptlauf</option>
                        <option value="children">Kinderlauf</option>
                      </select>
                    </div>
                    <div>
                      <Label>Max. Teilnehmer</Label>
                      <Input
                        type="number"
                        value={timeslot.max_participants}
                        onChange={(e) => {
                          const updated = [...newTimeslots];
                          updated[index].max_participants = parseInt(e.target.value);
                          setNewTimeslots(updated);
                        }}
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateEventDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCreateEvent}>
              Event erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.variant === "destructive" ? "Löschen" : "Bestätigen"}
      />
    </Layout>
  );
};

// Edit row components
const ParticipantEditRow = ({ participant, onSave, onCancel, onChange }: any) => (
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

const TimeslotEditRow = ({ timeslot, onSave, onCancel, onChange }: any) => (
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
      <select
        value={timeslot.type || 'normal'}
        onChange={(e) => onChange({...timeslot, type: e.target.value})}
        className="w-full p-1 border rounded text-sm bg-background"
      >
        <option value="normal">Hauptlauf</option>
        <option value="children">Kinderlauf</option>
      </select>
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