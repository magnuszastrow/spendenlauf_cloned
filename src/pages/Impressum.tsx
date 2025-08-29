import Layout from "@/components/Layout";

const Impressum = () => {
  return (
    <Layout showHero={false}>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Impressum</h1>
        
        <div className="bg-card rounded-lg p-6 shadow-sm space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Angaben gemäß § 5 TMG</h2>
            <div className="space-y-1 text-muted-foreground">
              <p className="font-medium text-foreground">Magnus Zastrow</p>
              <p>Bleckeder Landstraße 59</p>
              <p>21337 Lüneburg</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Kontakt</h2>
            <div className="space-y-1 text-muted-foreground">
              <p>
                <span className="font-medium">Telefon:</span>{" "}
                <a 
                  href="tel:+4917636387811"
                  className="text-primary hover:underline transition-colors"
                >
                  +49 176 363 878 11
                </a>
              </p>
              <p>
                <span className="font-medium">E-Mail:</span>{" "}
                <a 
                  href="mailto:onboarding@resend.dev"
                  className="text-primary hover:underline transition-colors"
                >
                  onboarding@resend.dev
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Haftung für Inhalte</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
              allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht 
              unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach 
              Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Haftung für Links</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
              Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten 
              Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Urheberrecht</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen 
              Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der 
              Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Datenschutz</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Informationen zum Datenschutz und zur Verarbeitung personenbezogener Daten finden Sie in unserer{" "}
              <a 
                href="/datenschutz"
                className="text-primary hover:underline transition-colors font-medium"
              >
                Datenschutzerklärung
              </a>.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Impressum;