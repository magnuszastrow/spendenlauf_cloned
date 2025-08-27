import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Users, User, Baby, Clock, Check } from "lucide-react";

// Validation schemas
const einzelanmeldungSchema = z.object({
  first_name: z.string().min(2, "Vorname muss mindestens 2 Zeichen haben"),
  last_name: z.string().min(2, "Nachname muss mindestens 2 Zeichen haben"),
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  age: z.number().min(16, "Mindestalter 16 Jahre").max(99, "Maximalalter 99 Jahre"),
  start_time: z.enum(["11:00", "14:30"], {
    required_error: "Bitte wählen Sie eine Startzeit",
  }),
});

const teamSchema = z.object({
  team_name: z.string().min(2, "Teamname muss mindestens 2 Zeichen haben"),
  team_leader_name: z.string().min(2, "Name des Teamleiters erforderlich"),
  team_leader_email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  team_size: z.number().min(2, "Team muss mindestens 2 Personen haben").max(10, "Maximal 10 Personen pro Team"),
  start_time: z.enum(["11:00", "14:30"], {
    required_error: "Bitte wählen Sie eine Startzeit",
  }),
});

const kinderlaufSchema = z.object({
  child_first_name: z.string().min(2, "Vorname muss mindestens 2 Zeichen haben"),
  child_last_name: z.string().min(2, "Nachname muss mindestens 2 Zeichen haben"),
  child_age: z.number().min(6, "Mindestalter 6 Jahre").max(15, "Maximalalter 15 Jahre"),
  parent_name: z.string().min(2, "Name des Erziehungsberechtigten erforderlich"),
  parent_email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
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
  });

  const teamForm = useForm<TeamForm>({
    resolver: zodResolver(teamSchema),
  });

  const kinderlaufForm = useForm<KinderlaufForm>({
    resolver: zodResolver(kinderlaufSchema),
  });

  const onSubmitEinzelanmeldung = (data: EinzelanmeldungForm) => {
    console.log("Einzelanmeldung:", data);
    toast({
      title: "Anmeldung erfolgreich!",
      description: `${data.first_name} ${data.last_name} wurde für ${data.start_time} Uhr angemeldet.`,
    });
  };

  const onSubmitTeam = (data: TeamForm) => {
    console.log("Teamanmeldung:", data);
    toast({
      title: "Team erfolgreich angemeldet!",
      description: `Team "${data.team_name}" mit ${data.team_size} Personen wurde registriert.`,
    });
  };

  const onSubmitKinderlauf = (data: KinderlaufForm) => {
    console.log("Kinderlauf:", data);
    toast({
      title: "Kinderlauf-Anmeldung erfolgreich!",
      description: `${data.child_first_name} ${data.child_last_name} wurde für den Kinderlauf angemeldet.`,
    });
  };

  return (
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

                  <Button type="submit" variant="hero" size="lg" className="w-full">
                    <Check className="mr-2 h-4 w-4" />
                    Einzelanmeldung abschicken
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
                    name="team_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anzahl Teammitglieder *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="5" 
                            min="2" 
                            max="10"
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                      name="child_first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vorname Kind *</FormLabel>
                          <FormControl>
                            <Input placeholder="Anna" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={kinderlaufForm.control}
                      name="child_last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nachname Kind *</FormLabel>
                          <FormControl>
                            <Input placeholder="Mustermann" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={kinderlaufForm.control}
                    name="child_age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alter Kind *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="10" 
                            min="6" 
                            max="15"
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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

                  <div className="p-3 sm:p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      <Baby className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Der Kinderlauf findet um 10:00 Uhr statt und ist für Kinder von 6-15 Jahren geeignet.
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
  );
};