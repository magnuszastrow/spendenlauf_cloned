import * as React from "react";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { SecureInput } from "@/components/SecureInput";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Users, User, Baby, Clock, Check, Plus, Minus, Phone, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { checkRateLimit, validateEmail, validateName, validatePhone } from "@/lib/security";

// Validation schemas - Updated for manual timeslot selection for adults
const einzelanmeldungSchema = z.object({
  first_name: z.string().min(2, "Vorname muss mindestens 2 Zeichen haben"),
  last_name: z.string().min(2, "Nachname muss mindestens 2 Zeichen haben"),
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  age: z.number().min(3, "Mindestalter 3 Jahre").max(110, "Maximalalter 110 Jahre"),
  gender: z.enum(["männlich", "weiblich", "divers"], {
    required_error: "Bitte wählen Sie ein Geschlecht",
  }),
  timeslot_id: z.string().optional(),
  join_existing_team: z.boolean().default(false),
  team_name: z.string().optional(),
  team_id: z.string().optional(),
  liability_waiver: z.boolean().refine((val) => val === true, {
    message: "Sie müssen die Haftungsbefreiung akzeptieren",
  }),
  privacy_consent: z.boolean().refine((val) => val === true, {
    message: "Sie müssen der Datenschutzerklärung zustimmen",
  }),
}).refine((data) => {
  if (data.join_existing_team) {
    return data.team_id && data.team_id.length >= 1;
  }
  return true;
}, {
  message: "Team-ID ist erforderlich um einem bestehenden Team beizutreten",
  path: ["team_id"],
}).refine((data) => {
  // Require timeslot selection for adults (age >= 10)
  if (data.age >= 10) {
    return data.timeslot_id && data.timeslot_id.length > 0;
  }
  return true;
}, {
  message: "Bitte wählen Sie eine Startzeit",
  path: ["timeslot_id"],
});

const teamMemberSchema = z.object({
  first_name: z.string().min(2, "Vorname erforderlich"),
  last_name: z.string().min(2, "Nachname erforderlich"),
  email: z.string().email("Gültige E-Mail erforderlich"),
  age: z.number().min(16, "Mindestalter 16 Jahre").max(99, "Maximalalter 99 Jahre"),
  gender: z.enum(["männlich", "weiblich", "divers"], {
    required_error: "Bitte wählen Sie ein Geschlecht",
  }),
});

const teamSchema = z.object({
  team_name: z.string().min(2, "Teamname muss mindestens 2 Zeichen haben"),
  shared_email: z.string().optional(),
  use_shared_email: z.boolean().default(false),
  timeslot_id: z.string().min(1, "Bitte wählen Sie eine Startzeit"),
  team_members: z.array(teamMemberSchema).min(1, "Mindestens ein Teammitglied erforderlich"),
  liability_waiver: z.boolean().refine((val) => val === true, {
    message: "Sie müssen die Haftungsbefreiung akzeptieren",
  }),
  privacy_consent: z.boolean().refine((val) => val === true, {
    message: "Sie müssen der Datenschutzerklärung zustimmen",
  }),
}).refine((data) => {
  if (data.use_shared_email) {
    return data.shared_email && data.shared_email.length > 0 && z.string().email().safeParse(data.shared_email).success;
  }
  return true;
}, {
  message: "E-Mail ist erforderlich wenn 'Eine E-Mail für alle' aktiviert ist",
  path: ["shared_email"],
});

const childSchema = z.object({
  first_name: z.string().min(2, "Vorname erforderlich"),
  last_name: z.string().min(2, "Nachname erforderlich"),
  age: z.number().min(1, "Mindestalter 1 Jahr").max(9, "Maximalalter 9 Jahre"),
  gender: z.enum(["männlich", "weiblich", "divers"], {
    required_error: "Bitte wählen Sie ein Geschlecht",
  }),
});

const kinderlaufSchema = z.object({
  children: z.array(childSchema).min(1, "Mindestens ein Kind erforderlich"),
  parent_name: z.string().min(2, "Name des Erziehungsberechtigten erforderlich"),
  parent_email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  parent_phone: z.string().min(5, "Telefonnummer des Erziehungsberechtigten erforderlich"),
  team_name: z.string().optional(),
  join_existing_team: z.boolean().default(false),
  existing_team_id: z.string().optional(),
  liability_waiver: z.boolean().refine((val) => val === true, {
    message: "Sie müssen die Haftungsbefreiung akzeptieren",
  }),
  privacy_consent: z.boolean().refine((val) => val === true, {
    message: "Sie müssen der Datenschutzerklärung zustimmen",
  }),
}).refine((data) => {
  if (data.children.length > 1 && !data.team_name && !data.join_existing_team) {
    return false;
  }
  if (data.join_existing_team) {
    return data.existing_team_id && data.existing_team_id.length >= 1;
  }
  return true;
}, {
  message: "Bei mehreren Kindern ist ein Teamname erforderlich, oder Team-Beitritt muss konfiguriert werden",
  path: ["team_name"],
});

type EinzelanmeldungForm = z.infer<typeof einzelanmeldungSchema>;
type TeamForm = z.infer<typeof teamSchema>;
type KinderlaufForm = z.infer<typeof kinderlaufSchema>;

export const CharityRunSignup = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("einzelanmeldung");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeslots, setTimeslots] = useState<Array<{
    id: string;
    name: string;
    time: string;
    type: string;
    max_participants: number;
    current_participants: number;
    is_full: boolean;
  }>>([]);
  const [loading, setLoading] = useState(true);

  // Forms - Updated with timeslot selection for adults
  const einzelanmeldungForm = useForm<EinzelanmeldungForm>({
    resolver: zodResolver(einzelanmeldungSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      age: 18,
      gender: "männlich",
      timeslot_id: "",
      join_existing_team: false,
      team_id: "",
      liability_waiver: false,
      privacy_consent: false,
    },
  });

  const teamForm = useForm<TeamForm>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      team_name: "",
      shared_email: "",
      use_shared_email: false,
      timeslot_id: "",
      team_members: [{ first_name: "", last_name: "", email: "", age: 18, gender: "männlich" }],
      liability_waiver: false,
      privacy_consent: false,
    },
  });

  const kinderlaufForm = useForm<KinderlaufForm>({
    resolver: zodResolver(kinderlaufSchema),
    defaultValues: {
      children: [{ first_name: "", last_name: "", age: 8, gender: "männlich" }],
      parent_name: "",
      parent_email: "",
      parent_phone: "",
      team_name: "",
      join_existing_team: false,
      existing_team_id: "",
      liability_waiver: false,
      privacy_consent: false,
    },
  });

  // Field arrays for dynamic forms
  const { fields: teamMemberFields, append: appendTeamMember, remove: removeTeamMember } = useFieldArray({
    control: teamForm.control,
    name: "team_members",
  });

  const { fields: childrenFields, append: appendChild, remove: removeChild } = useFieldArray({
    control: kinderlaufForm.control,
    name: "children",
  });

  // Watch values for conditional rendering
  const watchJoinTeam = einzelanmeldungForm.watch("join_existing_team");
  const watchUseSharedEmail = teamForm.watch("use_shared_email");
  const watchSharedEmail = teamForm.watch("shared_email");
  const watchChildrenCount = kinderlaufForm.watch("children");
  const watchJoinExistingTeam = kinderlaufForm.watch("join_existing_team");

  // Load timeslots on component mount
  React.useEffect(() => {
    const loadTimeslots = async () => {
      try {
        const { data: events } = await supabase
          .from('events')
          .select('id')
          .eq('registration_open', true)
          .limit(1);

        if (events && events.length > 0) {
          const { data: timeslotsData } = await supabase
            .from('timeslots')
            .select(`
              id,
              name,
              time,
              type,
              max_participants,
              participants!timeslot_id(count)
            `)
            .eq('event_id', events[0].id)
            .eq('type', 'normal') // Only load normal timeslots for adult selection
            .order('time');

          if (timeslotsData) {
            const processedTimeslots = timeslotsData.map(slot => ({
              id: slot.id,
              name: slot.name,
              time: slot.time,
              type: slot.type,
              max_participants: slot.max_participants,
              current_participants: slot.participants[0]?.count || 0,
              is_full: (slot.participants[0]?.count || 0) >= slot.max_participants
            }));
            setTimeslots(processedTimeslots);
          }
          
          // Ensure children timeslot exists
          await supabase.rpc('ensure_children_timeslot_exists', { 
            p_event_id: events[0].id 
          });
        }
      } catch (error) {
        console.error('Error loading timeslots:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTimeslots();
  }, []);

  // Update team member emails when shared email option is toggled
  React.useEffect(() => {
    if (watchUseSharedEmail && watchSharedEmail) {
      teamMemberFields.forEach((_, index) => {
        teamForm.setValue(`team_members.${index}.email`, watchSharedEmail);
      });
    }
  }, [watchUseSharedEmail, watchSharedEmail, teamForm, teamMemberFields]);

  const onSubmitEinzelanmeldung = async (data: EinzelanmeldungForm) => {
    setIsSubmitting(true);
    console.log('Starting individual registration submission:', { 
      firstName: data.first_name, 
      lastName: data.last_name,
      age: data.age,
      joinExistingTeam: data.join_existing_team,
      teamName: data.team_name 
    });

    // Security checks
    if (!checkRateLimit("einzelanmeldung")) {
      toast({
        title: "Zu viele Versuche",
        description: "Bitte warten Sie einen Moment bevor Sie es erneut versuchen.",
        variant: "destructive",
      });
      return;
    }

    // Validate inputs
    if (!validateName(data.first_name) || !validateName(data.last_name)) {
      toast({
        title: "Ungültige Eingabe",
        description: "Namen dürfen nur Buchstaben, Bindestriche und Leerzeichen enthalten.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(data.email)) {
      toast({
        title: "Ungültige E-Mail",
        description: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get the current event (assuming there's one active event)
      console.log('Fetching active events...');
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, name, year')
        .eq('registration_open', true)
        .limit(1);

      if (eventsError) {
        console.error('Database error fetching events:', eventsError);
        throw new Error(`Fehler beim Laden der Veranstaltung: ${eventsError.message}`);
      }

      if (!events || events.length === 0) {
        console.error('No active events found');
        throw new Error('Keine aktive Veranstaltung gefunden. Bitte kontaktieren Sie den Veranstalter.');
      }

      const eventId = events[0].id;
      console.log('Found active event:', { eventId, name: events[0].name, year: events[0].year });

      let teamId = null;
      
      if (data.join_existing_team && data.team_id) {
        console.log('Looking for existing team by ID:', data.team_id);
        // Find existing team by readable team ID using secure lookup
        const { data: teamLookupResult, error: teamError } = await supabase
          .rpc('lookup_team_by_id_or_name', { team_identifier: data.team_id });
        
        // Filter by event_id since the RPC function doesn't do this
        const teams = teamLookupResult?.filter(team => team.event_id === eventId) || [];

        if (teamError) {
          console.error('Database error fetching team by ID:', teamError);
          throw new Error(`Fehler beim Suchen des Teams: ${teamError.message}`);
        }

        if (!teams || teams.length === 0) {
          console.error('Team not found by ID:', data.team_id);
          throw new Error(`Team mit ID "${data.team_id}" wurde nicht gefunden. Bitte überprüfen Sie die Team-ID.`);
        }
        
        teamId = teams[0].id;
        console.log('Found team by ID:', { teamId, name: teams[0].name, readableId: teams[0].readable_team_id });
      }

      // Prepare participant data (include selected timeslot for adults, auto-assign for children)
      const participantData = {
        event_id: eventId,
        team_id: teamId,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        age: data.age,
        gender: data.gender === 'männlich' ? 'male' : data.gender === 'weiblich' ? 'female' : 'other',
        participant_type: data.age < 10 ? 'child' : 'adult',
        ...(data.age >= 10 && data.timeslot_id ? { timeslot_id: data.timeslot_id } : {})
      };

      console.log('Inserting participant:', { ...participantData, email: '[REDACTED]' });

      // Insert participant
      const { error: participantError } = await supabase
        .from('participants')
        .insert(participantData);

      if (participantError) {
        console.error('Database error inserting participant:', participantError);
        
        // Provide more specific error messages based on error codes
        let errorMessage = `Fehler bei der Registrierung: ${participantError.message}`;
        
        if (participantError.code === '23514') {
          if (participantError.message.includes('email_required_for_adults')) {
            errorMessage = 'E-Mail-Adresse ist für Erwachsene erforderlich.';
          } else if (participantError.message.includes('gender_check')) {
            errorMessage = 'Ungültiges Geschlecht ausgewählt.';
          }
        } else if (participantError.code === '23505') {
          errorMessage = 'Diese E-Mail-Adresse ist bereits registriert.';
        }
        
        throw new Error(errorMessage);
      }

      console.log('Individual registration successful');
      
      // Get team details for success message if joined a team
      let successDescription = "";
      if (data.join_existing_team && teamId) {
        const { data: teamDetails } = await supabase
          .from('teams')
          .select('name, readable_team_id')
          .eq('id', teamId)
          .single();
        
        if (teamDetails) {
          successDescription = `${data.first_name} ${data.last_name} wurde zum Team "${teamDetails.name}" (${teamDetails.readable_team_id}) hinzugefügt.`;
        } else {
          successDescription = `${data.first_name} ${data.last_name} wurde zum Team hinzugefügt.`;
        }
      } else {
        const timeslotType = data.age < 10 ? 'Kinderlauf' : 'Hauptlauf';
        successDescription = `${data.first_name} ${data.last_name} wurde für den ${timeslotType} angemeldet.`;
      }
      
        // Send confirmation email
        try {
          console.log('Sending confirmation email for individual registration...');
          
          // Get appropriate timeslot details for confirmation
          const isChild = data.age < 10;
          const appropriateTimeslot = timeslots.find(ts => 
            isChild ? ts.type === 'children' : ts.type === 'normal'
          );
          const timeslotTime = appropriateTimeslot ? appropriateTimeslot.time.substring(0, 5) : 'N/A';
          
          const { error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
            body: {
              firstName: data.first_name,
              email: data.email,
              registrationType: 'individual',
              startTime: timeslotTime,
            }
          });
        
        if (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the registration, just log the error
        } else {
          console.log('Confirmation email sent successfully');
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the registration, just log the error
      }
      
      toast({
        title: "Anmeldung erfolgreich!",
        description: successDescription,
      });
      
      einzelanmeldungForm.reset();
    } catch (error) {
      console.error('Individual registration failed:', error);
      const errorMessage = error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten";
      
      toast({
        title: "Fehler bei der Anmeldung",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitTeam = async (data: TeamForm) => {
    setIsSubmitting(true);
    console.log('Starting team registration submission:', { 
      teamName: data.team_name, 
      memberCount: data.team_members.length,
      useSharedEmail: data.use_shared_email 
    });

    // Security checks
    if (!checkRateLimit("team")) {
      toast({
        title: "Zu viele Versuche",
        description: "Bitte warten Sie einen Moment bevor Sie es erneut versuchen.",
        variant: "destructive",
      });
      return;
    }

    // Validate team name
    if (!validateName(data.team_name)) {
      toast({
        title: "Ungültiger Teamname",
        description: "Teamname darf nur Buchstaben, Zahlen, Bindestriche und Leerzeichen enthalten.",
        variant: "destructive",
      });
      return;
    }

    // Validate all team member data
    for (const member of data.team_members) {
      if (!validateName(member.first_name) || !validateName(member.last_name)) {
        toast({
          title: "Ungültige Teammitglied-Daten",
          description: "Namen dürfen nur Buchstaben, Bindestriche und Leerzeichen enthalten.",
          variant: "destructive",
        });
        return;
      }
      if (!validateEmail(member.email)) {
        toast({
          title: "Ungültige E-Mail",
          description: `Ungültige E-Mail-Adresse für ${member.first_name} ${member.last_name}.`,
          variant: "destructive",
        });
        return;
      }
    }

    if (data.use_shared_email && data.shared_email && !validateEmail(data.shared_email)) {
      toast({
        title: "Ungültige Team-E-Mail",
        description: "Bitte geben Sie eine gültige Team-E-Mail-Adresse ein.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Validate team data
      if (data.team_members.length === 0) {
        throw new Error('Mindestens ein Teammitglied ist erforderlich.');
      }

      // Get the current event
      console.log('Fetching active events for team registration...');
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, name, year')
        .eq('registration_open', true)
        .limit(1);

      if (eventsError) {
        console.error('Database error fetching events for team:', eventsError);
        throw new Error(`Fehler beim Laden der Veranstaltung: ${eventsError.message}`);
      }

      if (!events || events.length === 0) {
        console.error('No active events found for team registration');
        throw new Error('Keine aktive Veranstaltung gefunden. Bitte kontaktieren Sie den Veranstalter.');
      }

      const eventId = events[0].id;
      console.log('Found active event for team:', { eventId, name: events[0].name });

      // Check if team name already exists (normalize for comparison)
      const normalizedTeamName = data.team_name.toLowerCase().replace(/\s+/g, '');
      console.log('Checking if team name already exists:', { original: data.team_name, normalized: normalizedTeamName });
      
      const { data: existingTeams, error: checkTeamError } = await supabase
        .from('teams')
        .select('id, name, readable_team_id')
        .eq('event_id', eventId);

      if (checkTeamError) {
        console.error('Error checking existing team names:', checkTeamError);
        throw new Error(`Fehler beim Überprüfen des Teamnamens: ${checkTeamError.message}`);
      }

      if (existingTeams && existingTeams.length > 0) {
        // Check for normalized name conflicts
        const conflictingTeam = existingTeams.find(team => 
          team.name.toLowerCase().replace(/\s+/g, '') === normalizedTeamName
        );
        
        if (conflictingTeam) {
          console.error('Team name already exists (normalized):', { original: data.team_name, conflicting: conflictingTeam.name });
          throw new Error(`Teamname schon vergeben - wenn du dich einem Team hinzufügen willst brauchst du dessen Team ID: ${conflictingTeam.readable_team_id}`);
        }
      }

      // Create team first
      const teamData = {
        event_id: eventId,
        name: data.team_name,
        shared_email: data.use_shared_email,
        team_email: data.shared_email || null
      };

      console.log('Creating team:', { ...teamData, team_email: '[REDACTED]' });
      
      const { data: createdTeam, error: teamError } = await supabase
        .from('teams')
        .insert(teamData)
        .select('id, name, readable_team_id')
        .single();

      if (teamError) {
        console.error('Database error creating team:', teamError);
        throw new Error(`Fehler beim Erstellen des Teams: ${teamError.message}`);
      }

      if (!createdTeam) {
        console.error('Team creation returned no data');
        throw new Error('Team konnte nicht erstellt werden.');
      }

      console.log('Team created successfully:', { teamId: createdTeam.id, name: createdTeam.name });

      // Insert all team members
      const participants = [];
      const existingParticipantUpdates = [];

      for (const [index, member] of data.team_members.entries()) {
        console.log(`Processing team member ${index + 1}:`, { 
          firstName: member.first_name, 
          lastName: member.last_name, 
          age: member.age 
        });

        // Check if this participant already exists as an individual registration
        const { data: existingParticipant, error: checkError } = await supabase
          .from('participants')
          .select('id, team_id, first_name, last_name, email')
          .eq('first_name', member.first_name)
          .eq('last_name', member.last_name)
          .eq('email', member.email)
          .eq('event_id', eventId)
          .eq('participant_type', 'adult')
          .maybeSingle();

        if (checkError) {
          console.error(`Error checking existing participant for ${member.first_name} ${member.last_name} (${member.email}):`, checkError);
          throw new Error(`Fehler beim Überprüfen bestehender Teilnehmer: ${checkError.message}`);
        }

        if (existingParticipant) {
          if (existingParticipant.team_id) {
            console.log(`Participant ${member.first_name} ${member.last_name} (${member.email}) already belongs to a team`);
            throw new Error(`${member.first_name} ${member.last_name} ist bereits einem Team zugeordnet.`);
          }

          console.log(`Found existing individual participant ${member.first_name} ${member.last_name} (${member.email}), will update with team_id`);
          existingParticipantUpdates.push({
            id: existingParticipant.id,
            team_id: createdTeam.id,
            timeslot_id: data.timeslot_id,
            // Update other fields in case they changed
            first_name: member.first_name,
            last_name: member.last_name,
            age: member.age,
            gender: member.gender === 'männlich' ? 'male' : member.gender === 'weiblich' ? 'female' : 'other'
          });
        } else {
          console.log(`New team member ${member.first_name} ${member.last_name} (${member.email}), will create new participant`);
          participants.push({
            event_id: eventId,
            team_id: createdTeam.id,
            timeslot_id: data.timeslot_id,
            first_name: member.first_name,
            last_name: member.last_name,
            email: member.email,
            age: member.age,
            gender: member.gender === 'männlich' ? 'male' : member.gender === 'weiblich' ? 'female' : 'other',
            participant_type: 'adult'
          });
        }
      }

      // Update existing participants with team_id
      if (existingParticipantUpdates.length > 0) {
        console.log(`Updating ${existingParticipantUpdates.length} existing participants with team assignment...`);
        
        for (const update of existingParticipantUpdates) {
          const { error: updateError } = await supabase
            .from('participants')
            .update({
              team_id: update.team_id,
              timeslot_id: update.timeslot_id,
              first_name: update.first_name,
              last_name: update.last_name,
              age: update.age,
              gender: update.gender
            })
            .eq('id', update.id);

          if (updateError) {
            console.error('Error updating existing participant:', updateError);
            
            // Try to clean up the created team
            console.log('Attempting to clean up created team due to participant update failure...');
            await supabase.from('teams').delete().eq('id', createdTeam.id);
            
            throw new Error(`Fehler beim Aktualisieren bestehender Teilnehmer: ${updateError.message}`);
          }
        }
      }

      // Insert new participants
      if (participants.length > 0) {
        console.log(`Inserting ${participants.length} new team members...`);
        const { error: participantsError } = await supabase
          .from('participants')
          .insert(participants);

        if (participantsError) {
          console.error('Database error inserting new team members:', participantsError);
          
          // Try to clean up the created team and revert any updates
          console.log('Attempting to clean up created team and revert updates due to insertion failure...');
          await supabase.from('teams').delete().eq('id', createdTeam.id);
          
          // Revert team_id updates for existing participants
          if (existingParticipantUpdates.length > 0) {
            for (const update of existingParticipantUpdates) {
              await supabase
                .from('participants')
                .update({ team_id: null })
                .eq('id', update.id);
            }
          }
          
          let errorMessage = `Fehler beim Registrieren neuer Teammitglieder: ${participantsError.message}`;
          
          if (participantsError.code === '23505') {
            errorMessage = 'Eine oder mehrere E-Mail-Adressen sind bereits registriert.';
          } else if (participantsError.code === '23514') {
            errorMessage = 'Ungültige Daten bei einem Teammitglied. Bitte überprüfen Sie alle Eingaben.';
          }
          
          throw new Error(errorMessage);
        }
      }

      const totalMembers = data.team_members.length;
      const updatedMembers = existingParticipantUpdates.length;
      const newMembers = participants.length;

      let description = `Team "${data.team_name}" mit ${totalMembers} Personen wurde registriert. Team-ID: ${createdTeam.readable_team_id}`;
      if (updatedMembers > 0) {
        description += ` ${updatedMembers} bereits registrierte Teilnehmer wurden dem Team hinzugefügt.`;
      }

      console.log('Team registration completed successfully');
      
      // Send confirmation emails to all team members
      try {
        console.log('Sending confirmation emails for team registration...');
        
        const emailPromises = data.team_members.map(async (member) => {
          // Get appropriate timeslot details for confirmation
          const isAdult = member.age >= 16; // team members are adults
          const appropriateTimeslot = timeslots.find(ts => 
            isAdult ? ts.type === 'normal' : ts.type === 'children'
          );
          const timeslotTime = appropriateTimeslot ? appropriateTimeslot.time.substring(0, 5) : 'N/A';
          
          const { error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
            body: {
              firstName: member.first_name,
              email: member.email,
              registrationType: 'team',
              teamName: data.team_name,
              teamStartTime: timeslotTime,
              teamId: createdTeam.readable_team_id,
            }
          });
          
          if (emailError) {
            console.error(`Failed to send confirmation email to ${member.email}:`, emailError);
          } else {
            console.log(`Confirmation email sent to ${member.email}`);
          }
        });
        
        // If shared email is used, send one email to the shared address
        if (data.use_shared_email && data.shared_email) {
          const appropriateTimeslot = timeslots.find(ts => ts.type === 'normal'); // team members are adults
          const timeslotTime = appropriateTimeslot ? appropriateTimeslot.time.substring(0, 5) : 'N/A';
          
          emailPromises.push(
            supabase.functions.invoke('send-confirmation-email', {
              body: {
                firstName: data.team_members[0]?.first_name || 'Team',
                email: data.shared_email,
                registrationType: 'team',
                teamName: data.team_name,
                teamStartTime: timeslotTime,
                teamId: createdTeam.readable_team_id,
              }
            }).then(({ error: emailError }) => {
              if (emailError) {
                console.error(`Failed to send shared confirmation email to ${data.shared_email}:`, emailError);
              } else {
                console.log(`Shared confirmation email sent to ${data.shared_email}`);
              }
            })
          );
        }
        
        // Wait for all emails to complete (don't fail registration if emails fail)
        await Promise.allSettled(emailPromises);
      } catch (emailError) {
        console.error('Error sending team confirmation emails:', emailError);
        // Don't fail the registration, just log the error
      }
      
      toast({
        title: "Team erfolgreich angemeldet!",
        description: description,
      });
      
      teamForm.reset();
    } catch (error) {
      console.error('Team registration failed:', error);
      const errorMessage = error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten";
      
      toast({
        title: "Fehler bei der Team-Anmeldung",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const onSubmitKinderlauf = async (data: KinderlaufForm) => {
    console.log('Starting children run registration submission:', { 
      parentName: data.parent_name,
      childrenCount: data.children.length,
      joinExistingTeam: data.join_existing_team,
      teamName: data.team_name 
    });

    try {
      // Validate children data
      if (data.children.length === 0) {
        throw new Error('Mindestens ein Kind ist erforderlich.');
      }

      // Get the current event
      console.log('Fetching active events for children run...');
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, name, year')
        .eq('registration_open', true)
        .limit(1);

      if (eventsError) {
        console.error('Database error fetching events for children run:', eventsError);
        throw new Error(`Fehler beim Laden der Veranstaltung: ${eventsError.message}`);
      }

      if (!events || events.length === 0) {
        console.error('No active events found for children run');
        throw new Error('Keine aktive Veranstaltung gefunden. Bitte kontaktieren Sie den Veranstalter.');
      }

      const eventId = events[0].id;
      console.log('Found active event for children run:', { eventId, name: events[0].name });

      // Parse parent name (basic splitting)
      const nameParts = data.parent_name.trim().split(' ');
      const parentFirstName = nameParts[0] || data.parent_name;
      const parentLastName = nameParts.slice(1).join(' ') || '';

      // Create guardian first
      const guardianData = {
        first_name: parentFirstName,
        last_name: parentLastName,
        email: data.parent_email,
        phone: data.parent_phone
      };

      console.log('Creating guardian:', { ...guardianData, email: '[REDACTED]', phone: '[REDACTED]' });

      const { data: createdGuardian, error: guardianError } = await supabase
        .from('guardians')
        .insert(guardianData)
        .select('id')
        .single();

      if (guardianError) {
        console.error('Database error creating guardian:', guardianError);
        
        let errorMessage = `Fehler beim Registrieren der Erziehungsberechtigten: ${guardianError.message}`;
        if (guardianError.code === '23505') {
          errorMessage = 'Diese E-Mail-Adresse ist bereits für einen Erziehungsberechtigten registriert.';
        }
        
        throw new Error(errorMessage);
      }

      if (!createdGuardian) {
        console.error('Guardian creation returned no data');
        throw new Error('Erziehungsberechtigte/r konnte nicht registriert werden.');
      }

      console.log('Guardian created successfully:', { guardianId: createdGuardian.id });

      let teamId = null;

      // Handle team creation or joining
      if (data.children.length > 1 && data.team_name && !data.join_existing_team) {
        console.log('Creating new team for multiple children:', data.team_name);
        
        // Check if team name already exists
        const { data: existingTeams, error: checkTeamError } = await supabase
          .from('teams')
          .select('id, name')
          .eq('name', data.team_name)
          .eq('event_id', eventId);

        if (checkTeamError) {
          console.error('Error checking existing team names for children:', checkTeamError);
          throw new Error(`Fehler beim Überprüfen des Teamnamens: ${checkTeamError.message}`);
        }

        if (existingTeams && existingTeams.length > 0) {
          console.error('Team name already exists for children:', data.team_name);
          throw new Error(`Teamname "${data.team_name}" ist bereits vergeben. Bitte wählen Sie einen anderen Namen.`);
        }

        // Create new team for multiple children
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .insert({
            event_id: eventId,
            name: data.team_name,
            shared_email: false,
            team_email: data.parent_email
          })
          .select('id, name')
          .single();

        if (teamError) {
          console.error('Database error creating children team:', teamError);
          throw new Error(`Fehler beim Erstellen des Teams: ${teamError.message}`);
        }

        if (!teamData) {
          console.error('Children team creation returned no data');
          throw new Error('Team konnte nicht erstellt werden.');
        }

        teamId = teamData.id;
        console.log('Children team created successfully:', { teamId, name: teamData.name });
      } else if (data.join_existing_team && data.existing_team_id) {
        console.log('Looking for existing team for children by ID:', data.existing_team_id);
        
        // Find existing team by readable team ID using secure lookup
        const { data: teamLookupResult, error: teamError } = await supabase
          .rpc('lookup_team_by_id_or_name', { team_identifier: data.existing_team_id });
        
        // Filter by event_id since the RPC function doesn't do this
        const teams = teamLookupResult?.filter(team => team.event_id === eventId) || [];

        if (teamError) {
          console.error('Database error fetching existing team for children:', teamError);
          throw new Error(`Fehler beim Suchen des Teams: ${teamError.message}`);
        }

        if (!teams || teams.length === 0) {
          console.error('Existing team not found for children by ID:', data.existing_team_id);
          throw new Error(`Team mit ID "${data.existing_team_id}" wurde nicht gefunden. Bitte überprüfen Sie die Team-ID.`);
        }
        
        teamId = teams[0].id;
        console.log('Found existing team for children by ID:', { teamId, name: teams[0].name, readableId: teams[0].readable_team_id });
      }

      // Insert all children as participants
      const participants = data.children.map((child, index) => {
        console.log(`Preparing child ${index + 1}:`, { 
          firstName: child.first_name, 
          lastName: child.last_name, 
          age: child.age 
        });
        
        return {
          event_id: eventId,
          team_id: teamId,
          guardian_id: createdGuardian.id,
          first_name: child.first_name,
          last_name: child.last_name,
          age: child.age,
          gender: child.gender === 'männlich' ? 'male' : child.gender === 'weiblich' ? 'female' : 'other',
          participant_type: 'child'
        };
      });

      console.log(`Inserting ${participants.length} children as participants...`);
      const { error: participantsError } = await supabase
        .from('participants')
        .insert(participants);

      if (participantsError) {
        console.error('Database error inserting children participants:', participantsError);
        
        // Try to clean up created guardian and team if participant insertion fails
        console.log('Attempting to clean up created guardian and team due to participant insertion failure...');
        await supabase.from('guardians').delete().eq('id', createdGuardian.id);
        if (teamId) {
          await supabase.from('teams').delete().eq('id', teamId);
        }
        
        let errorMessage = `Fehler beim Registrieren der Kinder: ${participantsError.message}`;
        
        if (participantsError.code === '23514') {
          if (participantsError.message.includes('email_required_for_adults')) {
            errorMessage = 'Interne Fehler: Kinder sollten keine E-Mail-Adresse benötigen.';
          } else {
            errorMessage = 'Ungültige Daten bei einem Kind. Bitte überprüfen Sie alle Eingaben.';
          }
        }
        
        throw new Error(errorMessage);
      }

      const childCount = data.children.length;
      let message = "";
      
      if (data.join_existing_team && teamId) {
        // Get team details for success message
        const { data: teamDetails } = await supabase
          .from('teams')
          .select('name, readable_team_id')
          .eq('id', teamId)
          .single();
        
        if (teamDetails) {
          message = childCount === 1 
            ? `${data.children[0].first_name} ${data.children[0].last_name} wurde zum Team "${teamDetails.name}" (${teamDetails.readable_team_id}) hinzugefügt.`
            : `${childCount} Kinder wurden zum Team "${teamDetails.name}" (${teamDetails.readable_team_id}) hinzugefügt.`;
        } else {
          message = childCount === 1 
            ? `${data.children[0].first_name} ${data.children[0].last_name} wurde zum Team hinzugefügt.`
            : `${childCount} Kinder wurden zum Team hinzugefügt.`;
        }
      } else {
        message = childCount === 1 
          ? `${data.children[0].first_name} ${data.children[0].last_name} wurde für den Kinderlauf angemeldet.`
          : `${childCount} Kinder wurden für den Kinderlauf angemeldet.`;
        
        if (teamId) {
          // They created a new team
          const { data: teamDetails } = await supabase
            .from('teams')
            .select('name, readable_team_id')
            .eq('id', teamId)
            .single();
          
          if (teamDetails) {
            message += ` Team-ID: ${teamDetails.readable_team_id}`;
          }
        }
      }
      
      console.log('Children run registration completed successfully');
      
      // Send confirmation email to parent/guardian
      try {
        console.log('Sending confirmation email for children run registration...');
        const { error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
          body: {
            firstName: data.parent_name.split(' ')[0] || data.parent_name,
            email: data.parent_email,
            registrationType: 'children',
          }
        });
        
        if (emailError) {
          console.error('Failed to send children run confirmation email:', emailError);
          // Don't fail the registration, just log the error
        } else {
          console.log('Children run confirmation email sent successfully');
        }
      } catch (emailError) {
        console.error('Error sending children run confirmation email:', emailError);
        // Don't fail the registration, just log the error
      }
      
      toast({
        title: "Kinderlauf-Anmeldung erfolgreich!",
        description: message,
      });
      
      kinderlaufForm.reset();
    } catch (error) {
      console.error('Children run registration failed:', error);
      const errorMessage = error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten";
      
      toast({
        title: "Fehler bei der Kinderlauf-Anmeldung",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="w-full">
      <Card className="shadow-card bg-gradient-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Anmeldung
          </CardTitle>
          <CardDescription className="text-sm">
            Wählen Sie Ihren Anmeldungstyp und füllen Sie das Formular aus
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-auto p-1">
              <TabsTrigger value="einzelanmeldung" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5 px-1 sm:px-3">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Einzelanmeldung</span>
                <span className="sm:hidden">Einzel</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5 px-1 sm:px-3">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Ganzes Team</span>
                <span className="sm:hidden">Team</span>
              </TabsTrigger>
              <TabsTrigger value="kinderlauf" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5 px-1 sm:px-3">
                <Baby className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Kinderlauf</span>
                <span className="sm:hidden">Kinder</span>
              </TabsTrigger>
            </TabsList>

            {/* Einzelanmeldung */}
            <TabsContent value="einzelanmeldung" className="mt-4 sm:mt-6">
              <Form {...einzelanmeldungForm}>
                <form onSubmit={einzelanmeldungForm.handleSubmit(onSubmitEinzelanmeldung)} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={einzelanmeldungForm.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                           <FormLabel>Vorname *</FormLabel>
                           <FormControl>
                             <SecureInput placeholder="Max" {...field} />
                           </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={einzelanmeldungForm.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                           <FormLabel>Nachname *</FormLabel>
                           <FormControl>
                             <SecureInput placeholder="Muster" {...field} />
                           </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={einzelanmeldungForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                         <FormLabel>E-Mail *</FormLabel>
                         <FormControl>
                           <SecureInput type="email" placeholder="max@example.com" {...field} />
                         </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={einzelanmeldungForm.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                           <FormLabel>Alter *</FormLabel>
                           <FormControl>
                             <SecureInput 
                               type="number" 
                               placeholder="25" 
                               {...field} 
                               onChange={(e) => field.onChange(Number(e.target.value))}
                             />
                           </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={einzelanmeldungForm.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Geschlecht *</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-row space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="männlich" id="gender-m" />
                                <Label htmlFor="gender-m">Männlich</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="weiblich" id="gender-w" />
                                <Label htmlFor="gender-w">Weiblich</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="divers" id="gender-d" />
                                <Label htmlFor="gender-d">Divers</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Watch age to show timeslot selection for adults */}
                  {einzelanmeldungForm.watch("age") >= 10 ? (
                    <FormField
                      control={einzelanmeldungForm.control}
                      name="timeslot_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Startzeit *</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="space-y-2"
                            >
                               {loading ? (
                                <div className="text-sm text-muted-foreground">Lädt verfügbare Startzeiten...</div>
                              ) : timeslots.length > 0 ? (
                                timeslots.map((timeslot) => {
                                  // Find timeslot with most capacity
                                  const mostCapacitySlot = timeslots.reduce((max, current) => 
                                    (current.max_participants - current.current_participants) > (max.max_participants - max.current_participants) ? current : max
                                  );
                                  const hasMostCapacity = mostCapacitySlot.id === timeslot.id;
                                  
                                  return (
                                    <div key={timeslot.id} className="flex items-center space-x-2 p-3 rounded-md border">
                                      <RadioGroupItem 
                                        value={timeslot.id} 
                                        id={`timeslot-${timeslot.id}`}
                                        disabled={timeslot.is_full}
                                      />
                                      <Label 
                                        htmlFor={`timeslot-${timeslot.id}`}
                                        className={`flex-1 ${timeslot.is_full ? 'text-muted-foreground' : ''}`}
                                      >
                                        <div className="flex justify-between items-center">
                                          <span>
                                            {timeslot.name} - {timeslot.time.substring(0, 5)} Uhr
                                          </span>
                                          <span className="text-sm text-muted-foreground">
                                            {hasMostCapacity ? "Mehr freie Kapazität" : ""}
                                            {timeslot.is_full && " (Ausgebucht)"}
                                          </span>
                                        </div>
                                      </Label>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-sm text-muted-foreground">Keine verfügbaren Startzeiten gefunden.</div>
                              )}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <Clock className="inline h-4 w-4 mr-2" />
                        Kinder unter 10 Jahren werden automatisch dem Kinderlauf (09:00 Uhr) zugeordnet.
                      </p>
                    </div>
                  )}

                  <FormField
                    control={einzelanmeldungForm.control}
                    name="join_existing_team"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Zu bestehendem Team hinzufügen
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Ich möchte mich einem bereits existierenden Team anschließen
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {watchJoinTeam && (
                    <FormField
                      control={einzelanmeldungForm.control}
                      name="team_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Team-ID *
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">Die Team-ID erhalten Sie bei der Team-Erstellung</p>
                              </TooltipContent>
                            </Tooltip>
                           </FormLabel>
                           <FormControl>
                             <SecureInput placeholder="TEAM-0001" {...field} />
                           </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    )}

                    {/* Legal Checkboxes */}
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <FormField
                        control={einzelanmeldungForm.control}
                        name="liability_waiver"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                Hiermit bestätige ich, dass ich auf eigene Verantwortung teilnehme und die Veranstalter von jeglicher Haftung für Schäden, Verletzungen oder Unfälle freistelle.
                              </FormLabel>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={einzelanmeldungForm.control}
                        name="privacy_consent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                Ich willige ein, dass meine persönlichen Daten gemäß der Datenschutzerklärung zur Durchführung der Veranstaltung verarbeitet werden. Diese Einwilligung kann ich jederzeit widerrufen.
                              </FormLabel>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                     <Button 
                      type="submit" 
                      variant="hero" 
                      size="lg" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                          Wird verarbeitet...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          {watchJoinTeam ? "Team beitreten" : "Einzelanmeldung abschicken"}
                        </>
                      )}
                    </Button>
                </form>
              </Form>
            </TabsContent>

            {/* Team Anmeldung */}
            <TabsContent value="team" className="mt-4 sm:mt-6">
              <Form {...teamForm}>
                <form onSubmit={teamForm.handleSubmit(onSubmitTeam)} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={teamForm.control}
                      name="team_name"
                      render={({ field }) => (
                        <FormItem>
                           <FormLabel>Teamname *</FormLabel>
                           <FormControl>
                             <SecureInput placeholder="Die Schnellen Läufer" {...field} />
                           </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={teamForm.control}
                      name="shared_email"
                      render={({ field }) => (
                        <FormItem>
                           <FormLabel>E-Mail für alle (optional)</FormLabel>
                           <FormControl>
                             <SecureInput type="email" placeholder="team@example.com" {...field} />
                           </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={teamForm.control}
                    name="use_shared_email"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Eine E-Mail für alle Teammitglieder verwenden
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Alle Teammitglieder erhalten die gleiche E-Mail-Adresse
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={teamForm.control}
                    name="timeslot_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Startzeit für das ganze Team *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="space-y-2"
                          >
                            {loading ? (
                              <div className="text-sm text-muted-foreground">Lädt verfügbare Startzeiten...</div>
                            ) : timeslots.length > 0 ? (
                              timeslots.map((timeslot) => {
                                // Find timeslot with most capacity
                                const mostCapacitySlot = timeslots.reduce((max, current) => 
                                  (current.max_participants - current.current_participants) > (max.max_participants - max.current_participants) ? current : max
                                );
                                const hasMostCapacity = mostCapacitySlot.id === timeslot.id;
                                
                                return (
                                  <div key={timeslot.id} className="flex items-center space-x-2 p-3 rounded-md border">
                                    <RadioGroupItem 
                                      value={timeslot.id} 
                                      id={`team-timeslot-${timeslot.id}`}
                                      disabled={timeslot.is_full}
                                    />
                                    <Label 
                                      htmlFor={`team-timeslot-${timeslot.id}`}
                                      className={`flex-1 ${timeslot.is_full ? 'text-muted-foreground' : ''}`}
                                    >
                                      <div className="flex justify-between items-center">
                                        <span>
                                          {timeslot.name} - {timeslot.time.substring(0, 5)} Uhr
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                          {hasMostCapacity ? "Mehr freie Kapazität" : ""}
                                          {timeslot.is_full && " (Ausgebucht)"}
                                        </span>
                                      </div>
                                    </Label>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-sm text-muted-foreground">Keine verfügbaren Startzeiten gefunden.</div>
                            )}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Teammitglieder ({teamMemberFields.length} Personen)</h3>
                    </div>

                    {teamMemberFields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Teammitglied {index + 1}</h4>
                          {teamMemberFields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTeamMember(index)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={teamForm.control}
                            name={`team_members.${index}.first_name`}
                            render={({ field }) => (
                              <FormItem>
                                 <FormLabel>Vorname *</FormLabel>
                                 <FormControl>
                                   <SecureInput placeholder="Max" {...field} />
                                 </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={teamForm.control}
                            name={`team_members.${index}.last_name`}
                            render={({ field }) => (
                              <FormItem>
                                 <FormLabel>Nachname *</FormLabel>
                                 <FormControl>
                                   <SecureInput placeholder="Muster" {...field} />
                                 </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <FormField
                             control={teamForm.control}
                             name={`team_members.${index}.email`}
                             render={({ field }) => (
                               <FormItem>
                                  <FormLabel>E-Mail *</FormLabel>
                                  <FormControl>
                                    <SecureInput 
                                      type="email" 
                                      placeholder="max@example.com" 
                                      {...field} 
                                      disabled={watchUseSharedEmail}
                                    />
                                  </FormControl>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />
                           <FormField
                             control={teamForm.control}
                             name={`team_members.${index}.age`}
                             render={({ field }) => (
                               <FormItem>
                                  <FormLabel>Alter *</FormLabel>
                                  <FormControl>
                                    <SecureInput 
                                      type="number" 
                                      placeholder="25" 
                                      {...field} 
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />
                         </div>

                         <FormField
                           control={teamForm.control}
                           name={`team_members.${index}.gender`}
                           render={({ field }) => (
                             <FormItem>
                               <FormLabel>Geschlecht *</FormLabel>
                               <FormControl>
                                 <RadioGroup
                                   onValueChange={field.onChange}
                                   value={field.value}
                                   className="flex flex-row space-x-4"
                                 >
                                   <div className="flex items-center space-x-2">
                                     <RadioGroupItem value="männlich" id={`team-gender-m-${index}`} />
                                     <Label htmlFor={`team-gender-m-${index}`}>Männlich</Label>
                                   </div>
                                   <div className="flex items-center space-x-2">
                                     <RadioGroupItem value="weiblich" id={`team-gender-w-${index}`} />
                                     <Label htmlFor={`team-gender-w-${index}`}>Weiblich</Label>
                                   </div>
                                   <div className="flex items-center space-x-2">
                                     <RadioGroupItem value="divers" id={`team-gender-d-${index}`} />
                                     <Label htmlFor={`team-gender-d-${index}`}>Divers</Label>
                                   </div>
                                 </RadioGroup>
                               </FormControl>
                               <FormMessage />
                             </FormItem>
                           )}
                         />
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendTeamMember({ first_name: "", last_name: "", email: watchUseSharedEmail ? watchSharedEmail || "" : "", age: 18, gender: "männlich" })}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Mitglied hinzufügen
                    </Button>
                  </div>

                  <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <Clock className="inline h-4 w-4 mr-2" />
                      Zeitslots werden automatisch zugewiesen: Teammitglieder (ab 16 Jahre) starten beim Hauptlauf.
                    </p>
                   </div>

                    {/* Legal Checkboxes */}
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <FormField
                        control={teamForm.control}
                        name="liability_waiver"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                Hiermit bestätige ich, dass ich auf eigene Verantwortung teilnehme und die Veranstalter von jeglicher Haftung für Schäden, Verletzungen oder Unfälle freistelle.
                              </FormLabel>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={teamForm.control}
                        name="privacy_consent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                Ich willige ein, dass meine persönlichen Daten gemäß der Datenschutzerklärung zur Durchführung der Veranstaltung verarbeitet werden. Diese Einwilligung kann ich jederzeit widerrufen.
                              </FormLabel>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                     type="submit" 
                     variant="hero" 
                     size="lg" 
                     className="w-full"
                     disabled={isSubmitting}
                   >
                     {isSubmitting ? (
                       <>
                         <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                         Wird verarbeitet...
                       </>
                     ) : (
                       <>
                         <Users className="mr-2 h-4 w-4" />
                         Team anmelden
                       </>
                     )}
                   </Button>
                </form>
              </Form>
            </TabsContent>

            {/* Kinderlauf */}
            <TabsContent value="kinderlauf" className="mt-4 sm:mt-6">
              <Form {...kinderlaufForm}>
                <form onSubmit={kinderlaufForm.handleSubmit(onSubmitKinderlauf)} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={kinderlaufForm.control}
                      name="parent_name"
                      render={({ field }) => (
                        <FormItem>
                           <FormLabel>Name Erziehungsberechtigter *</FormLabel>
                           <FormControl>
                             <SecureInput placeholder="Maria Muster" {...field} />
                           </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={kinderlaufForm.control}
                      name="parent_email"
                      render={({ field }) => (
                        <FormItem>
                           <FormLabel>E-Mail Erziehungsberechtigter *</FormLabel>
                           <FormControl>
                             <SecureInput type="email" placeholder="maria@example.com" {...field} />
                           </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={kinderlaufForm.control}
                    name="parent_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Telefonnummer Erziehungsberechtigter *
                        </FormLabel>
                         <FormControl>
                           <SecureInput type="tel" placeholder="+49 123 456789" {...field} />
                         </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Kinder ({childrenFields.length})</h3>
                    </div>

                    {childrenFields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Kind {index + 1}</h4>
                          {childrenFields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeChild(index)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                           <FormField
                             control={kinderlaufForm.control}
                             name={`children.${index}.first_name`}
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel>Vorname *</FormLabel>
                                 <FormControl>
                                   <SecureInput placeholder="Anna" {...field} />
                                 </FormControl>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />
                           <FormField
                             control={kinderlaufForm.control}
                             name={`children.${index}.last_name`}
                             render={({ field }) => (
                               <FormItem>
                                  <FormLabel>Nachname *</FormLabel>
                                  <FormControl>
                                    <SecureInput placeholder="Muster" {...field} />
                                  </FormControl>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />
                           <FormField
                             control={kinderlaufForm.control}
                             name={`children.${index}.age`}
                             render={({ field }) => (
                               <FormItem>
                                  <FormLabel>Alter *</FormLabel>
                                  <FormControl>
                                    <SecureInput 
                                      type="number" 
                                      placeholder="8" 
                                      min="1" 
                                      max="9"
                                      {...field} 
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />
                         </div>

                         <FormField
                           control={kinderlaufForm.control}
                           name={`children.${index}.gender`}
                           render={({ field }) => (
                             <FormItem>
                               <FormLabel>Geschlecht *</FormLabel>
                               <FormControl>
                                 <RadioGroup
                                   onValueChange={field.onChange}
                                   value={field.value}
                                   className="flex flex-row space-x-4"
                                 >
                                   <div className="flex items-center space-x-2">
                                     <RadioGroupItem value="männlich" id={`child-gender-m-${index}`} />
                                     <Label htmlFor={`child-gender-m-${index}`}>Männlich</Label>
                                   </div>
                                   <div className="flex items-center space-x-2">
                                     <RadioGroupItem value="weiblich" id={`child-gender-w-${index}`} />
                                     <Label htmlFor={`child-gender-w-${index}`}>Weiblich</Label>
                                   </div>
                                   <div className="flex items-center space-x-2">
                                     <RadioGroupItem value="divers" id={`child-gender-d-${index}`} />
                                     <Label htmlFor={`child-gender-d-${index}`}>Divers</Label>
                                   </div>
                                 </RadioGroup>
                               </FormControl>
                               <FormMessage />
                             </FormItem>
                           )}
                         />
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendChild({ first_name: "", last_name: "", age: 8, gender: "männlich" })}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Kind hinzufügen
                    </Button>
                  </div>

                  {watchChildrenCount.length > 1 && !watchJoinExistingTeam && (
                    <FormField
                      control={kinderlaufForm.control}
                      name="team_name"
                      render={({ field }) => (
                        <FormItem>
                           <FormLabel>Teamname (bei mehreren Kindern) *</FormLabel>
                           <FormControl>
                             <SecureInput placeholder="Die kleinen Läufer" {...field} />
                           </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {watchChildrenCount.length >= 1 && (
                    <>
                      <FormField
                        control={kinderlaufForm.control}
                        name="join_existing_team"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Zu bestehendem Team hinzufügen
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                {watchChildrenCount.length === 1 
                                  ? "Das Kind soll einem bereits existierenden Team beitreten"
                                  : "Die Kinder sollen einem bereits existierenden Team beitreten"
                                }
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />

                      {watchJoinExistingTeam && (
                        <FormField
                          control={kinderlaufForm.control}
                          name="existing_team_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Team-ID *
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-sm">Die Team-ID erhalten Sie bei der Team-Erstellung</p>
                                  </TooltipContent>
                                </Tooltip>
                              </FormLabel>
                               <FormControl>
                                 <SecureInput placeholder="TEAM-0001" {...field} />
                               </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                    </>
                  )}

                  <div className="p-3 sm:p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      <Baby className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Der Kinderlauf findet um 13:30 Uhr statt und ist für Kinder bis 10 Jahren geeignet.
                    </p>
                    </div>

                    {/* Legal Checkboxes */}
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <FormField
                        control={kinderlaufForm.control}
                        name="liability_waiver"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                Hiermit bestätige ich, dass ich auf eigene Verantwortung teilnehme und die Veranstalter von jeglicher Haftung für Schäden, Verletzungen oder Unfälle freistelle.
                              </FormLabel>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={kinderlaufForm.control}
                        name="privacy_consent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                Ich willige ein, dass meine persönlichen Daten gemäß der Datenschutzerklärung zur Durchführung der Veranstaltung verarbeitet werden. Diese Einwilligung kann ich jederzeit widerrufen.
                              </FormLabel>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                     type="submit" 
                     variant="sport" 
                     size="lg" 
                     className="w-full"
                     disabled={isSubmitting}
                   >
                     {isSubmitting ? (
                       <>
                         <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                         Wird verarbeitet...
                       </>
                     ) : (
                       <>
                         <Baby className="mr-2 h-4 w-4" />
                         Zum Kinderlauf anmelden
                       </>
                     )}
                   </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
};