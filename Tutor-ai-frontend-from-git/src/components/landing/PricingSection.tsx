import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function PricingSection() {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Gratuit',
      price: '0€',
      period: '/mois',
      description: 'Parfait pour commencer',
      features: [
        '10 questions IA par jour',
        'Suivi de progression basique',
        '3 matières',
        'Support communautaire',
      ],
      cta: 'Commencer',
      popular: false,
    },
    {
      name: 'Pro',
      price: '19€',
      period: '/mois',
      description: 'Pour les apprenants sérieux',
      features: [
        'Questions IA illimitées',
        'Analyses avancées',
        'Toutes les matières',
        'Support prioritaire',
        'Plans d\'étude personnalisés',
        'Accès hors ligne',
      ],
      cta: 'Essai gratuit',
      popular: true,
    },
    {
      name: 'Entreprise',
      price: 'Sur mesure',
      period: '',
      description: 'Pour les écoles et institutions',
      features: [
        'Tout dans Pro',
        'Tableau de bord admin',
        'Licences en volume',
        'Intégrations personnalisées',
        'Support dédié',
        'Garantie SLA',
      ],
      cta: 'Contacter les ventes',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Tarifs
          </span>
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Tarification simple et{' '}
            <span className="gradient-text">transparente</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Choisissez le plan qui correspond à vos besoins d'apprentissage. Tous les plans incluent l'accès à notre tuteur IA.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl border p-8 ${
                plan.popular
                  ? 'border-primary bg-gradient-to-b from-primary/10 to-transparent shadow-lg shadow-primary/20'
                  : 'border-border bg-card'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 rounded-full gradient-primary px-4 py-1 text-sm font-medium text-white">
                    <Sparkles className="h-4 w-4" />
                    Le plus populaire
                  </div>
                </div>
              )}

              {/* Plan Details */}
              <div className="text-center">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-full p-1 ${
                      plan.popular ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                onClick={() => navigate('/register')}
                className={`mt-8 w-full ${
                  plan.popular
                    ? 'gradient-primary text-white hover:opacity-90'
                    : ''
                }`}
                variant={plan.popular ? 'default' : 'outline'}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
