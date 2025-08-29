import Layout from "@/components/Layout";

const Datenschutz = () => {
  return (
    <Layout showHero={false}>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Datenschutzerklärung</h1>
        
        <div className="bg-card rounded-lg p-6 shadow-sm space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">1. Datenschutz auf einen Blick</h2>
            <h3 className="text-lg font-medium mb-2 text-foreground">Allgemeine Hinweise</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten 
              passiert, wenn Sie diese Website besuchen oder sich für den Spendenlauf anmelden. Personenbezogene Daten 
              sind alle Daten, mit denen Sie persönlich identifiziert werden können.
            </p>
            
            <h3 className="text-lg font-medium mb-2 text-foreground">Datenerfassung auf dieser Website</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können 
              Sie dem Impressum dieser Website entnehmen. Ihre Daten werden zum einen dadurch erhoben, dass Sie uns 
              diese mitteilen (z.B. bei der Anmeldung zum Spendenlauf). Andere Daten werden automatisch beim Besuch 
              der Website durch unsere IT-Systeme erfasst.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">2. Verantwortlicher</h2>
            <div className="text-muted-foreground text-sm space-y-1">
              <p className="font-medium text-foreground">Magnus Zastrow</p>
              <p>Bleckeder Landstraße 59</p>
              <p>21337 Lüneburg</p>
              <p>
                <span className="font-medium">Telefon:</span>{" "}
                <a href="tel:+4917636387811" className="text-primary hover:underline">
                  +49 176 363 878 11
                </a>
              </p>
              <p>
                <span className="font-medium">E-Mail:</span>{" "}
                <a href="mailto:onboarding@resend.dev" className="text-primary hover:underline">
                  onboarding@resend.dev
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">3. Erhebung und Verarbeitung personenbezogener Daten</h2>
            
            <h3 className="text-lg font-medium mb-2 text-foreground">Anmeldung zum Spendenlauf</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Bei der Anmeldung zum Spendenlauf erheben wir folgende Daten:
            </p>
            <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1 mb-4 ml-4">
              <li>Name und Vorname</li>
              <li>E-Mail-Adresse</li>
              <li>Telefonnummer (optional)</li>
              <li>Teamname (bei Teamanmeldung)</li>
              <li>Informationen zu Kindern (bei Kinderlauf-Anmeldung)</li>
            </ul>
            
            <h3 className="text-lg font-medium mb-2 text-foreground">Zweck der Datenverarbeitung</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Die Verarbeitung Ihrer personenbezogenen Daten erfolgt zu folgenden Zwecken:
            </p>
            <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1 mb-4 ml-4">
              <li>Organisation und Durchführung des Spendenlaufs</li>
              <li>Kommunikation mit den Teilnehmern</li>
              <li>Erstellung von Teilnehmerlisten und Startunterlagen</li>
              <li>Erfüllung rechtlicher Verpflichtungen</li>
            </ul>
            
            <h3 className="text-lg font-medium mb-2 text-foreground">Rechtsgrundlage</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Die Verarbeitung erfolgt auf Grundlage Ihrer Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO und 
              zur Erfüllung eines Vertrags nach Art. 6 Abs. 1 lit. b DSGVO.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">4. Datenspeicherung und -löschung</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Ihre Daten werden nur so lange gespeichert, wie dies für die Durchführung der Veranstaltung 
              erforderlich ist. Nach Abschluss der Veranstaltung werden die Daten spätestens nach 6 Monaten 
              gelöscht, sofern keine rechtlichen Aufbewahrungspflichten bestehen.
            </p>
            
            <h3 className="text-lg font-medium mb-2 text-foreground">Datenverarbeitung durch Supabase</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Für die technische Umsetzung nutzen wir den Dienst Supabase. Ihre Daten werden sicher in 
              europäischen Rechenzentren gespeichert und verarbeitet. Supabase fungiert als unser 
              Auftragsverarbeiter nach Art. 28 DSGVO.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">5. Speicherung für zukünftige Veranstaltungen</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Bei der Anmeldung haben Sie die Möglichkeit, der Speicherung Ihrer Daten für zukünftige Veranstaltungen zuzustimmen. 
              Diese Einwilligung ist vollständig freiwillig und hat keinen Einfluss auf Ihre Teilnahme an der aktuellen Veranstaltung.
            </p>
            
            <h3 className="text-lg font-medium mb-2 text-foreground">Zweck der erweiterten Datenspeicherung</h3>
            <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1 mb-4 ml-4">
              <li>Information über kommende Charity-Läufe und ähnliche Veranstaltungen</li>
              <li>Vereinfachte Anmeldung bei zukünftigen Events (Ihre Daten sind bereits hinterlegt)</li>
              <li>Aufbau einer Community von regelmäßigen Teilnehmern</li>
            </ul>
            
            <h3 className="text-lg font-medium mb-2 text-foreground">Speicherdauer bei Einwilligung</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Bei erteilter Einwilligung werden Ihre Daten bis zu 3 Jahre gespeichert oder bis zum Widerruf Ihrer Einwilligung. 
              Sie erhalten maximal 2-3 Informationen pro Jahr über neue Veranstaltungen. Jede E-Mail enthält einen Abmeldelink.
            </p>
            
            <h3 className="text-lg font-medium mb-2 text-foreground">Widerruf der Einwilligung</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sie können diese Einwilligung jederzeit widerrufen. Bei Widerruf werden Ihre Daten nur noch für die 
              aktuelle Veranstaltung (bis 6 Monate nach Ende) gespeichert. Kontaktieren Sie uns einfach über die 
              oben genannten Kontaktdaten.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">6. Ihre Rechte</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
            </p>
            <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1 mb-4 ml-4">
              <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
              <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
              <li>Recht auf Löschung (Art. 17 DSGVO)</li>
              <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Recht auf Widerspruch (Art. 21 DSGVO)</li>
              <li>Recht auf Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
            </ul>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Zur Ausübung Ihrer Rechte wenden Sie sich bitte an die oben genannten Kontaktdaten.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">7. Beschwerderecht</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über unsere Verarbeitung 
              personenbezogener Daten zu beschweren. Zuständig ist die Datenschutzaufsichtsbehörde des 
              Bundeslandes, in dem Sie Ihren Wohnsitz haben.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">8. Änderungen dieser Datenschutzerklärung</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen 
              rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der 
              Datenschutzerklärung umzusetzen.
            </p>
          </section>

          <div className="text-xs text-muted-foreground pt-4 border-t border-border">
            Stand: {new Date().toLocaleDateString('de-DE')}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Datenschutz;