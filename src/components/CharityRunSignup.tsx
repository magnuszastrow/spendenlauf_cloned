import * as React from "react";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Validation schemas
const einzelanmeldungSchema = z.object({
  first_name: z.string().min(2, "Vorname muss mindestens 2 Zeichen haben"),
  last_name: z.string().min(2, "Nachname muss mindestens 2 Zeichen haben"),
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  age: z.number().min(3, "Mindestalter 3 Jahre").max(110, "Maximalalter 110 Jahre"),
  gender: z.enum(["männlich", "weiblich", "divers"], {
    required_error: "Bitte wählen Sie ein Geschlecht",
  }),
  start_time: z.enum(["11:00", "14:30"], {
    required_error: "Bitte wählen Sie eine Startzeit",
  }),
  join_existing_team: z.boolean().default(false),
  team_name: z.string().optional(),
  team_id: z.string().optional(),
}).refine((data) => {
  if (data.join_existing_team) {
    return data.team_name && data.team_name.length >= 2 && data.team_id && data.team_id.length >= 1;
  }
  return true;
}, {
  message: "Teamname und Team-ID sind erforderlich",
  path: ["team_name"],
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
  team_members: z.array(teamMemberSchema).min(1, "Mindestens ein Teammitglied erforderlich"),
  start_time: z.enum(["11:00", "14:30"], {
    required_error: "Bitte wählen Sie eine Startzeit",
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
  existing_team_name: z.string().optional(),
  existing_team_id: z.string().optional(),
}).refine((data) => {
  if (data.children.length > 1 && !data.team_name && !data.join_existing_team) {
    return false;
  }
  if (data.join_existing_team) {
    return data.existing_team_name && data.existing_team_name.length >= 2 && data.existing_team_id && data.existing_team_id.length >= 1;
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

  // Forms
  const einzelanmeldungForm = useForm<EinzelanmeldungForm>({
    resolver: zodResolver(einzelanmeldungSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      age: 18,
      gender: "männlich",
      start_time: "11:00",
      join_existing_team: false,
      team_name: "",
      team_id: "",
    },
  });

  const teamForm = useForm<TeamForm>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      team_name: "",
      shared_email: "",
      use_shared_email: false,
      team_members: [{ first_name: "", last_name: "", email: "", age: 18, gender: "männlich" }],
      start_time: "11:00",
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
      existing_team_name: "",
      existing_team_id: "",
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

  // Update team member emails when shared email option is toggled
  React.useEffect(() => {
    if (watchUseSharedEmail && watchSharedEmail) {
      teamMemberFields.forEach((_, index) => {
        teamForm.setValue(`team_members.${index}.email`, watchSharedEmail);
      });
    }
  }, [watchUseSharedEmail, watchSharedEmail, teamForm, teamMemberFields]);

  const onSubmitEinzelanmeldung = async (data: EinzelanmeldungForm) => {
    try {
      // Get the current event (assuming there's one active event)
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id')
        .eq('registration_open', true)
        .limit(1);

      if (eventsError || !events || events.length === 0) {
        throw new Error('Keine aktive Veranstaltung gefunden');
      }

      const eventId = events[0].id;

      let teamId = null;
      
      if (data.join_existing_team && data.team_name) {
        // Find existing team by name
        const { data: teams, error: teamError } = await supabase
          .from('teams')
          .select('id')
          .eq('name', data.team_name)
          .eq('event_id', eventId)
          .limit(1);

        if (teamError || !teams || teams.length === 0) {
          throw new Error('Team nicht gefunden');
        }
        teamId = teams[0].id;
      }

      // Insert participant
      const { error: participantError } = await supabase
        .from('participants')
        .insert({
          event_id: eventId,
          team_id: teamId,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          age: data.age,
          gender: data.gender,
          participant_type: 'adult'
        });

      if (participantError) throw participantError;

      toast({
        title: "Anmeldung erfolgreich!",
        description: data.join_existing_team 
          ? `${data.first_name} ${data.last_name} wurde zum Team "${data.team_name}" hinzugefügt.`
          : `${data.first_name} ${data.last_name} wurde für ${data.start_time} Uhr angemeldet.`,
      });
      
      einzelanmeldungForm.reset();
    } catch (error) {
      console.error('Error submitting registration:', error);
      toast({
        title: "Fehler bei der Anmeldung",
        description: error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive",
      });
    }
  };

  const onSubmitTeam = async (data: TeamForm) => {
    try {
      // Get the current event
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id')
        .eq('registration_open', true)
        .limit(1);

      if (eventsError || !events || events.length === 0) {
        throw new Error('Keine aktive Veranstaltung gefunden');
      }

      const eventId = events[0].id;

      // Create team first
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          event_id: eventId,
          name: data.team_name,
          shared_email: data.use_shared_email,
          team_email: data.shared_email || null
        })
        .select('id')
        .single();

      if (teamError || !teamData) throw teamError;

      // Insert all team members
      const participants = data.team_members.map(member => ({
        event_id: eventId,
        team_id: teamData.id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        age: member.age,
        gender: member.gender,
        participant_type: 'adult'
      }));

      const { error: participantsError } = await supabase
        .from('participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      toast({
        title: "Team erfolgreich angemeldet!",
        description: `Team "${data.team_name}" mit ${data.team_members.length} Personen wurde registriert.`,
      });
      
      teamForm.reset();
    } catch (error) {
      console.error('Error submitting team registration:', error);
      toast({
        title: "Fehler bei der Team-Anmeldung",
        description: error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive",
      });
    }
  };

  const onSubmitKinderlauf = async (data: KinderlaufForm) => {
    try {
      // Get the current event
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id')
        .eq('registration_open', true)
        .limit(1);

      if (eventsError || !events || events.length === 0) {
        throw new Error('Keine aktive Veranstaltung gefunden');
      }

      const eventId = events[0].id;

      // Create guardian first
      const { data: guardianData, error: guardianError } = await supabase
        .from('guardians')
        .insert({
          first_name: data.parent_name.split(' ')[0] || data.parent_name,
          last_name: data.parent_name.split(' ').slice(1).join(' ') || '',
          email: data.parent_email,
          phone: data.parent_phone
        })
        .select('id')
        .single();

      if (guardianError || !guardianData) throw guardianError;

      let teamId = null;

      // Handle team creation or joining
      if (data.children.length > 1 && data.team_name && !data.join_existing_team) {
        // Create new team for multiple children
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .insert({
            event_id: eventId,
            name: data.team_name,
            shared_email: false,
            team_email: data.parent_email
          })
          .select('id')
          .single();

        if (teamError || !teamData) throw teamError;
        teamId = teamData.id;
      } else if (data.join_existing_team && data.existing_team_name) {
        // Find existing team
        const { data: teams, error: teamError } = await supabase
          .from('teams')
          .select('id')
          .eq('name', data.existing_team_name)
          .eq('event_id', eventId)
          .limit(1);

        if (teamError || !teams || teams.length === 0) {
          throw new Error('Team nicht gefunden');
        }
        teamId = teams[0].id;
      }

      // Insert all children as participants
      const participants = data.children.map(child => ({
        event_id: eventId,
        team_id: teamId,
        guardian_id: guardianData.id,
        first_name: child.first_name,
        last_name: child.last_name,
        age: child.age,
        gender: child.gender,
        participant_type: 'child'
      }));

      const { error: participantsError } = await supabase
        .from('participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      const childCount = data.children.length;
      const message = childCount === 1 
        ? `${data.children[0].first_name} ${data.children[0].last_name} wurde für den Kinderlauf angemeldet.`
        : `${childCount} Kinder wurden für den Kinderlauf angemeldet.`;
      
      toast({
        title: "Kinderlauf-Anmeldung erfolgreich!",
        description: message,
      });
      
      kinderlaufForm.reset();
    } catch (error) {
      console.error('Error submitting children registration:', error);
      toast({
        title: "Fehler bei der Kinderlauf-Anmeldung",
        description: error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten",
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
                            <Input placeholder="Max" {...field} />
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
                            <Input placeholder="Mustermann" {...field} />
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
                          <Input type="email" placeholder="max@example.com" {...field} />
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
                            <Input 
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

                  {!watchJoinTeam && (
                    <FormField
                      control={einzelanmeldungForm.control}
                      name="start_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Wähle deine Startzeit *
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-col space-y-3"
                            >
                              <div className="flex items-center space-x-3 p-3 rounded-lg border border-input hover:bg-accent/50 transition-colors">
                                <RadioGroupItem value="11:00" id="time1" />
                                <Label htmlFor="time1" className="text-sm sm:text-base cursor-pointer flex-1">11:00 Uhr - Durchlauf 1</Label>
                              </div>
                              <div className="flex items-center space-x-3 p-3 rounded-lg border border-input hover:bg-accent/50 transition-colors">
                                <RadioGroupItem value="14:30" id="time2" />
                                <Label htmlFor="time2" className="text-sm sm:text-base cursor-pointer flex-1">14:30 Uhr - Durchlauf 2</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={einzelanmeldungForm.control}
                        name="team_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teamname *</FormLabel>
                            <FormControl>
                              <Input placeholder="Die Schnellen Läufer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                                  <p className="text-sm">Die Teammitglieder haben die Team-ID per E-Mail erhalten</p>
                                </TooltipContent>
                              </Tooltip>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="T12345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <Button type="submit" variant="hero" size="lg" className="w-full">
                    <Check className="mr-2 h-4 w-4" />
                    {watchJoinTeam ? "Team beitreten" : "Einzelanmeldung abschicken"}
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
                            <Input placeholder="Die Schnellen Läufer" {...field} />
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
                            <Input type="email" placeholder="team@example.com" {...field} />
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
                                  <Input placeholder="Max" {...field} />
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
                                  <Input placeholder="Mustermann" {...field} />
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
                                   <Input 
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
                                   <Input 
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

                  <FormField
                    control={teamForm.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Wähle die Startzeit für das Team *
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-3"
                          >
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-input hover:bg-accent/50 transition-colors">
                              <RadioGroupItem value="11:00" id="team-time1" />
                              <Label htmlFor="team-time1" className="text-sm sm:text-base cursor-pointer flex-1">11:00 Uhr - Durchlauf 1</Label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-input hover:bg-accent/50 transition-colors">
                              <RadioGroupItem value="14:30" id="team-time2" />
                              <Label htmlFor="team-time2" className="text-sm sm:text-base cursor-pointer flex-1">14:30 Uhr - Durchlauf 2</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" variant="hero" size="lg" className="w-full">
                    <Users className="mr-2 h-4 w-4" />
                    Team anmelden
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
                            <Input placeholder="Maria Mustermann" {...field} />
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
                            <Input type="email" placeholder="maria@example.com" {...field} />
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
                          <Input type="tel" placeholder="+49 123 456789" {...field} />
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
                                   <Input placeholder="Anna" {...field} />
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
                                   <Input placeholder="Mustermann" {...field} />
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
                                   <Input 
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
                            <Input placeholder="Die kleinen Läufer" {...field} />
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={kinderlaufForm.control}
                            name="existing_team_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Teamname *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Die Schnellen Läufer" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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
                                      <p className="text-sm">Die Teammitglieder haben die Team-ID per E-Mail erhalten</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="T12345" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div className="p-3 sm:p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      <Baby className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Der Kinderlauf findet um 13:30 Uhr statt und ist für Kinder bis 10 Jahren geeignet.
                    </p>
                  </div>

                  <Button type="submit" variant="sport" size="lg" className="w-full">
                    <Baby className="mr-2 h-4 w-4" />
                    Zum Kinderlauf anmelden
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