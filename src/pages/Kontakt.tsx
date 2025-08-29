import Layout from "@/components/Layout";

const Kontakt = () => {
  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-semibold text-foreground mb-8 text-center">Kontakt</h1>
          
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Magnus Card */}
            <section className="bg-card rounded-lg shadow-card p-6 flex flex-col border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border">
                Magnus Zastrow
              </h3>
              <p className="text-muted-foreground mb-4">
                Ansprechpartner für Anmeldung, Sponsoring & allgemeine Fragen
              </p>
              <p className="text-foreground">
                <strong>Tel.:</strong>{" "}
                <a 
                  href="tel:+4917636387811"
                  className="text-primary hover:underline"
                >
                  +49 176 363 878 11
                </a>
              </p>
              <p className="text-foreground">
                <strong>E-Mail:</strong>{" "}
                <a
                  href="mailto:onboarding@resend.dev"
                  className="text-primary hover:underline break-words"
                >
                  onboarding@resend.dev
                </a>
              </p>
            </section>

            {/* Damien Card */}
            <section className="bg-card rounded-lg shadow-card p-6 flex flex-col border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border">
                Damien Massenbach
              </h3>
              <p className="text-muted-foreground mb-4">Ansprechpartner Logistik & Ablauf</p>
              <p className="text-foreground">
                <strong>Tel.:</strong>{" "}
                <a 
                  href="tel:+4917644227223"
                  className="text-primary hover:underline"
                >
                  +49 176 442 272 23
                </a>
              </p>
            </section>

            {/* Benedikt Card */}
            <section className="bg-card rounded-lg shadow-card p-6 flex flex-col border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border">
                Benedikt Löbbecke
              </h3>
              <p className="text-muted-foreground mb-4">Ansprechpartner Social- & Print-Media</p>
              <p className="text-foreground">
                <strong>Tel.:</strong>{" "}
                <a 
                  href="tel:+4915141998621"
                  className="text-primary hover:underline"
                >
                  +49 151 419 986 21
                </a>
              </p>
            </section>

            {/* Address Card */}
            <section className="bg-card rounded-lg shadow-card p-6 flex flex-col border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border">
                Anschrift
              </h3>
              <div className="space-y-1 text-foreground">
                <p>Lt Zastrow</p>
                <p>5./ AufklLehrBtl 3 Lüneburg</p>
                <p>Bleckeder Landstraße 59</p>
                <p>21337 Lüneburg</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Kontakt;