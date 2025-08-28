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
import { Users, User, Baby, Clock, Check, Plus, Minus, UserPlus, Phone, Info } from "lucide-react";

// Validation schemas
const einzelanmeldungSchema = z.object({
  first_name: z.string().min(2, "Vorname muss mindestens 2 Zeichen haben"),
  last_name: z.string().min(2, "Nachname muss mindestens 2 Zeichen haben"),
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  age: z.number().min(16, "Mindestalter 16 Jahre").max(99, "Maximalalter 99 Jahre"),
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
});

const teamSchema = z.object({
  team_name: z.string().min(2, "Teamname muss mindestens 2 Zeichen haben"),
  team_leader_name: z.string().min(2, "Name des Teamleiters erforderlich"),
  team_leader_email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  use_leader_email_for_all: z.boolean().default(false),
  team_members: z.array(teamMemberSchema).min(1, "Mindestens ein Teammitglied erforderlich"),
  start_time: z.enum(["11:00", "14:30"], {
    required_error: "Bitte wählen Sie eine Startzeit",
  }),
});

const childSchema = z.object({
  first_name: z.string().min(2, "Vorname erforderlich"),
  last_name: z.string().min(2, "Nachname erforderlich"),
  age: z.number().min(1, "Mindestalter 1 Jahr").max(9, "Maximalalter 9 Jahre"),
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
  if (data.join_existing_team && data.children.length === 1) {
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
      join_existing_team: false,
    },
  });

  const teamForm = useForm<TeamForm>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      use_leader_email_for_all: false,
      team_members: [{ first_name: "", last_name: "", email: "", age: 18 }],
    },
  });

  const kinderlaufForm = useForm<KinderlaufForm>({
    resolver: zodResolver(kinderlaufSchema),
    defaultValues: {
      children: [{ first_name: "", last_name: "", age: 8 }],
      join_existing_team: false,
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
  const watchUseLeaderEmail = teamForm.watch("use_leader_email_for_all");
  const watchLeaderEmail = teamForm.watch("team_leader_email");
  const watchChildrenCount = kinderlaufForm.watch("children");
  const watchJoinExistingTeam = kinderlaufForm.watch("join_existing_team");

  // Update team member emails when leader email option is toggled
  React.useEffect(() => {
    if (watchUseLeaderEmail && watchLeaderEmail) {
      teamMemberFields.forEach((_, index) => {
        teamForm.setValue(`team_members.${index}.email`, watchLeaderEmail);
      });
    }
  }, [watchUseLeaderEmail, watchLeaderEmail, teamForm, teamMemberFields]);

  const onSubmitEinzelanmeldung = (data: EinzelanmeldungForm) => {
    console.log("Einzelanmeldung:", data);
    toast({
      title: "Anmeldung erfolgreich!",
      description: data.join_existing_team 
        ? `${data.first_name} ${data.last_name} wurde zum Team "${data.team_name}" hinzugefügt.`
        : `${data.first_name} ${data.last_name} wurde für ${data.start_time} Uhr angemeldet.`,
    });
  };

  const onSubmitTeam = (data: TeamForm) => {
    console.log("Teamanmeldung:", data);
    const totalMembers = data.team_members.length + 1; // +1 for leader
    toast({
      title: "Team erfolgreich angemeldet!",
      description: `Team "${data.team_name}" mit ${totalMembers} Personen wurde registriert.`,
    });
  };

  const onSubmitKinderlauf = (data: KinderlaufForm) => {
    console.log("Kinderlauf:", data);
    const childCount = data.children.length;
    const message = childCount === 1 
      ? `${data.children[0].first_name} ${data.children[0].last_name} wurde für den Kinderlauf angemeldet.`
      : `${childCount} Kinder wurden für den Kinderlauf angemeldet.`;
    toast({
      title: "Kinderlauf-Anmeldung erfolgreich!",
      description: message,
    });
  };

  return (
    <TooltipProvider>
      <div className="w-full">
      <div className="text-center mb-6 px-2">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Charity Run Anmeldung
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Melden Sie sich für unseren Charity Run an!
        </p>
      </div>

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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={teamForm.control}
                      name="team_leader_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name Teamleiter *</FormLabel>
                          <FormControl>
                            <Input placeholder="Max Mustermann" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={teamForm.control}
                      name="team_leader_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-Mail Teamleiter *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="teamleiter@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={teamForm.control}
                    name="use_leader_email_for_all"
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
                            Teamleiter E-Mail für alle verwenden
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
                      <h3 className="text-lg font-medium">Teammitglieder ({teamMemberFields.length + 1} Personen)</h3>
                    </div>

                    {teamMemberFields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Teammitglied {index + 2}</h4>
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
                                    disabled={watchUseLeaderEmail}
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
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendTeamMember({ first_name: "", last_name: "", email: watchUseLeaderEmail ? watchLeaderEmail || "" : "", age: 18 })}
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
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendChild({ first_name: "", last_name: "", age: 8 })}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Kind hinzufügen
                    </Button>
                  </div>

                  {watchChildrenCount.length > 1 && (
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

                  {watchChildrenCount.length === 1 && (
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
                                Das Kind soll einem bereits existierenden Team beitreten
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
                      Der Kinderlauf findet um 13:30 Uhr statt und ist für Kinder unter 10 Jahren geeignet.
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