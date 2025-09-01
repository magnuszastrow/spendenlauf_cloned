import React from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const Info = () => {
  const navigate = useNavigate();

  // Fetch active event with simplified typing
  const { data: activeEvent, isLoading: eventLoading } = useQuery({
    queryKey: ["active-event"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("id, name, date, description, is_active")
          .eq("is_active", true)
          .maybeSingle();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error fetching active event:", error);
        return null;
      }
    },
  });

  // Fetch timeslots for active event with simplified typing
  const { data: timeslots, isLoading: timeslotsLoading } = useQuery({
    queryKey: ["timeslots", activeEvent?.id],
    queryFn: async () => {
      if (!activeEvent?.id) return [];
      
      try {
        const { data, error } = await supabase
          .from("timeslots")
          .select("id, name, time, description")
          .eq("event_id", activeEvent.id)
          .order("time");
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching timeslots:", error);
        return [];
      }
    },
    enabled: !!activeEvent?.id,
  });

  const isLoading = eventLoading || timeslotsLoading;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Datum wird noch bekannt gegeben";
    try {
      return format(new Date(dateString), "d. MMMM yyyy", { locale: de });
    } catch {
      return "Ungültiges Datum";
    }
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // Remove seconds from HH:MM:SS
  };

  return (
    <Layout>
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <Separator className="my-8" />
          <p className="text-center text-lg font-semibold">
            <strong>
              {isLoading ? "Lade Veranstaltung..." : 
               activeEvent ? `${formatDate(activeEvent.date)} - Kurpark` : 
               "Keine aktive Veranstaltung"}
            </strong>
          </p>
          <Separator className="my-8" />
          
          {/* Hero Text */}
          <p className="mt-6 text-lg text-center md:text-xl text-muted-foreground max-w-4xl mx-auto">
            {isLoading ? "Lade Veranstaltungsdetails..." : 
             activeEvent?.description || 
             "Wir, die Soldaten und Soldatinnen des Standorts Lüneburg, laufen gemeinsam mit euch für das Kinderhospiz Löwenherz in Lüneburg!"}
          </p>
          
          <div className="text-center mt-8 mb-12">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate("/anmeldung")}
              className="text-lg"
            >
              Jetzt anmelden
            </Button>
          </div>

          {/* Info Cards Grid */}
          <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            
            {/* Wann & Wo Card */}
            <Card className="flex flex-col h-full">
              <CardContent className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-semibold mb-4">
                  Wann &amp; Wo?
                </h3>
                
                <div className="space-y-3 text-sm">
                  <p><strong>Datum:</strong> {isLoading ? "Lade..." : formatDate(activeEvent?.date)}</p>
                  <p><strong>Ort:</strong> Kurpark Lüneburg</p>
                  
                  <div>
                    <p className="font-semibold mb-2">Startzeiten:</p>
                    {isLoading ? (
                      <p className="text-muted-foreground">Lade Startzeiten...</p>
                    ) : timeslots && timeslots.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {timeslots.map((slot: any) => (
                          <li key={slot.id}>
                            <strong>{formatTime(slot.time)}</strong> – {slot.name}
                            {slot.description && ` – ${slot.description}`}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">Startzeiten werden noch bekannt gegeben</p>
                    )}
                  </div>

                  <div className="mt-4">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4775.882701212507!2d10.400130578511469!3d53.23682763981093!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b1dc3337650751%3A0xf4ccf13e0a481185!2sUelzener%20Str.%2013%2C%2021335%20L%C3%BCneburg!5e0!3m2!1sde!2sde!4v1745414003880!5m2!1sde!2sde"
                      title="Google Maps Location"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full aspect-video rounded-md border-0"
                    />
                  </div>

                  <div className="mt-4 pt-2">
                    <p className="mb-2 text-sm">Folgt uns für Content zum Lüneburger Spendenlauf:</p>
                    <a 
                      href="https://www.instagram.com/spendenlauf_lueneburg" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                    >
                      <span className="text-sm">📷</span>
                      <span className="text-sm">@spendenlauf_lueneburg</span>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mitlaufen Card */}
            <Card className="flex flex-col h-full">
              <CardContent className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-semibold mb-4">
                  Mitlaufen
                </h3>
                
                <div className="space-y-3 text-sm text-muted-foreground flex-1">
                  <p><strong className="text-foreground">Online anmelden</strong> – Einzeln oder als Team, ihr erhaltet eine Bestätigungsmail.</p>
                  <p><strong className="text-foreground">Rechtzeitig ankommen</strong> – Läufernummer abholen (30 Min vor Start).</p>
                  <p><strong className="text-foreground">Runden laufen</strong> – Jede Runde wird durch unsere Sponsoren gefördert und mithilfe eurer freiwilliger Spenden ergänzt!</p>
                  <p><strong className="text-foreground">Auswertung</strong> – Nach jedem Durchlauf gibt es eine kleine Auswertung von Laufleistungen und gesammelten Spenden</p>
                </div>

                <div className="mt-6 pt-4">
                  <Button 
                    variant="hero" 
                    className="w-full"
                    onClick={() => navigate("/anmeldung")}
                  >
                    Jetzt anmelden
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Zuschauen Card */}
            <Card className="flex flex-col h-full">
              <CardContent className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-semibold mb-4">
                  Zuschauen
                </h3>
                
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Zuschauen</strong> – Wer nicht mitlaufen möchte, kann die Veranstaltung auch als Zuschauer unterstützen und Salziges (Bratwurst, Pommes) oder Süßes (Kuchen, Popcorn, Zuckerwatte) genießen.</p>
                  <p><strong className="text-foreground">Familien &amp; Kinderprogramm</strong> – Entsprechend unseres Mottos "Gemeinsam für Kinder" gibt es jede Menge Programm: Neben der Hüpfburg bieten wir noch Fußballdart, Dosenwerfen und Kinderschminken an - auch die Feuerwehr und Polizei sind vertreten und bringen Fahrzeuge mit!</p>
                </div>
              </CardContent>
            </Card>

            {/* Wofür Card */}
            <Card className="flex flex-col h-full">
              <CardContent className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-semibold mb-4">
                  Wofür?
                </h3>
                
                <div className="text-sm text-muted-foreground">
                  <a 
                    href="https://loewenherz.de/angebote/loewenherz-ambulant/kinderhospiz-stuetzpunkt-loewenherz-lueneburg/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block mb-4"
                  >
                    <div className="w-full h-20 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground border">
                      Löwenherz Logo
                    </div>
                  </a>
                  
                  <p className="text-justify leading-relaxed">
                    Der Stützpunkt Lüneburg des Kinderhospiz Löwenherz e. V. begleitet Familien mit lebensverkürzend erkranktem Kind.
                  </p>
                  <p className="text-justify leading-relaxed mt-3">
                    Die für ihre Aufgabe qualifizierten, ehrenamtlichen Begleiter*innen fahren einmal in der Woche für mehrere Stunden zur Familie, unterstützen im Alltag – und das oftmals über Jahre. Sie spielen mit dem erkrankten Kind, unternehmen Aktivitäten mit dem Geschwisterkind oder stehen den Eltern mit offenem Ohr zur Verfügung.
                  </p>
                  <p className="text-justify leading-relaxed mt-3">
                    Die ambulante Begleitung ist für die Familien kostenfrei.
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Info;