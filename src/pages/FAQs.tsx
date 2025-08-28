import { useState } from "react";
import Layout from "@/components/Layout";
import { ChevronDown } from "lucide-react";

const FAQs = () => {
  const faqs = [
    {
      question: "Parkmöglichkeiten",
      answer: "Es stehen nur wenige Parkplätze zur Verfügung (wir empfehlen, zu Fuß oder mit öffentlichen Verkehrsmitteln anzukommen)."
    },
    {
      question: "Taschenaufbewahrung",
      answer: "Taschen können wir während der Laufzeit trocken beherbergen."
    },
    {
      question: "Anfeuern",
      answer: "Nehmt Familie und Freunde zum Anfeuern mit: Vor Ort gibt es kleine Imbissstände und viel Programm für Kinder."
    },
    {
      question: "Spenden",
      answer: "Unsere Sponsoren übernehmen die Spenden für gelaufene Runden. Trotzdem freuen wir uns, wenn ihr eure erlaufenen Beträge durch einen eigenen Beitrag unterstützt (bar / online möglich)."
    },
    {
      question: "Kinderbetreuung",
      answer: "Kinder können wir (auf eigene Verantwortung) während der Laufzeiten betreuen."
    }
  ];
  
  const [openFaq, setOpenFaq] = useState<boolean[]>(Array(faqs.length).fill(false));

  const toggleFaq = (index: number) => {
    const newOpenFaq = [...openFaq];
    newOpenFaq[index] = !newOpenFaq[index];
    setOpenFaq(newOpenFaq);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-5xl">
        <h1 className="text-3xl font-semibold text-foreground mb-6 text-center">FAQs</h1>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-card shadow-card rounded-lg border border-border">
              <button 
                onClick={() => toggleFaq(index)}
                className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none hover:bg-muted/50 transition-colors rounded-lg"
              >
                <span className="text-xl font-medium text-foreground">
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`w-6 h-6 text-foreground transform transition-transform duration-200 ${
                    openFaq[index] ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq[index] && (
                <div className="px-6 pb-4 text-muted-foreground">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <section className="mt-8 bg-card shadow-card rounded-lg p-6 border border-border">
          <p className="text-muted-foreground mb-4">
            Folgt uns auf{" "}
            <a 
              href="https://instagram.com/spendenlauf_luenburg" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Instagram
            </a>{" "}
            um Bilder des Spendenlaufs zu sehen.
          </p>
          <p className="text-muted-foreground">
            Bei Fragen könnt ihr uns gerne kontaktieren oder schaut in unsere{" "}
            <a href="/faqs" className="text-primary hover:underline">
              FAQ
            </a>.
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default FAQs;