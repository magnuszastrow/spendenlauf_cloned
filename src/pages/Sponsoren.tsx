import { useState } from "react";
import Layout from "@/components/Layout";
import rotaryLogo from "@/assets/logo_rotary_lueneburg.png";
import wnmLogo from "@/assets/logo_wnm.svg";

interface Plan {
  id: string;
  name: string;
  previous?: string;
  perks: string[];
  rate: string;
  estimate: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

const Sponsoren = () => {
  const plans: Plan[] = [
    {
      id: 'basis',
      name: 'Basis Sponsor',
      perks: ['Social Media', 'Website', 'Flyer'],
      rate: '10 Cent / Runde',
      estimate: 'bis ca. 750 €',
      bgClass: 'bg-primary',
      borderClass: 'border-primary',
      textClass: 'text-primary-foreground'
    },
    {
      id: 'plus',
      name: 'Plus Sponsor',
      previous: 'Basis Sponsor',
      perks: ['Newsletter', 'Logo-Platzierung auf Plakaten'],
      rate: '20 Cent / Runde',
      estimate: 'bis ca. 1.500 €',
      bgClass: 'bg-accent',
      borderClass: 'border-accent',
      textClass: 'text-accent-foreground'
    },
    {
      id: 'premium',
      name: 'Premium Sponsor',
      previous: 'Plus Sponsor',
      perks: [
        'Platzierung am Tag des Laufs (Stand, Preisübergabe etc.)',
        'Mediale Wirkung (Radio, lokales TV)'
      ],
      rate: '30 Cent / Runde',
      estimate: 'bis ca. 2.250 €',
      bgClass: 'bg-destructive',
      borderClass: 'border-destructive',
      textClass: 'text-destructive-foreground'
    }
  ];

  const [active, setActive] = useState(plans[0].id);

  return (
    <Layout>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-semibold text-foreground mb-6">Unsere Sponsoren:</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="flex items-center justify-center p-4 bg-card rounded-lg border border-border">
              <a href="https://www.wnm.de" target="_blank" rel="noopener noreferrer">
                <div className="text-center">
                  <img 
                    src={wnmLogo} 
                    alt="WNM Logo" 
                    className="h-16 w-auto mx-auto mb-2"
                  />
                </div>
              </a>
            </div>

            <div className="flex items-center justify-center p-4 bg-card rounded-lg border border-border">
              <a href="https://lueneburg.rotary.de/" target="_blank" rel="noopener noreferrer">
                <div className="text-center">
                  <img 
                    src={rotaryLogo} 
                    alt="Rotary Lüneburg Logo" 
                    className="h-16 w-auto mx-auto mb-2"
                  />
                </div>
              </a>
            </div>
          </div>
          
          <hr className="border-border mb-6" />
          
          <h2 className="text-3xl font-semibold text-foreground mb-6">Sponsor werden:</h2>
        
          {/* Tab-Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setActive(plan.id)}
                className={`
                  px-3 py-2 text-center rounded-t-lg focus:outline-none
                  border-transparent min-w-0 whitespace-normal break-words
                  transition-colors
                  ${plan.bgClass} ${plan.textClass}
                  ${active === plan.id ? `border-2 ${plan.borderClass}` : ''}
                `}
              >
                {plan.name}
              </button>
            ))}
          </div>

          {/* Tab-Content */}
          {plans.map((plan) => (
            plan.id === active && (
              <div
                key={plan.id}
                className={`
                  flex flex-col justify-between p-6 shadow-card rounded-b-lg rounded-tr-lg border border-border
                  ${plan.bgClass} ${plan.textClass}
                `}
              >
                <header>
                  <h2 className="text-2xl font-extrabold mb-2">{plan.name}</h2>
                </header>
                {plan.previous && (
                  <p className="mb-2">{plan.previous} und:</p>
                )}
                <ul className="mb-4 list-disc list-inside space-y-1">
                  {plan.perks.map((perk, index) => (
                    <li key={index} className="leading-snug">{perk}</li>
                  ))}
                </ul>
                <footer className="mt-auto">
                  <p className="text-xl font-bold">{plan.rate}</p>
                  <p className="text-lg">{plan.estimate}</p>
                </footer>
              </div>
            )
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Sponsoren;