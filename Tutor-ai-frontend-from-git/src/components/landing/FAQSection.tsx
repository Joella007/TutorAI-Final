import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function FAQSection() {
  const faqs = [
    { 
      question: 'Comment fonctionne le tuteur IA ?', 
      answer: 'Notre tuteur IA utilise un traitement avancé du langage naturel pour comprendre vos questions et fournir des explications personnalisées. Il s\'adapte à votre style d\'apprentissage et se souvient de vos progrès pour offrir une aide de plus en plus pertinente.' 
    },
    { 
      question: 'Quelles matières sont couvertes ?', 
      answer: 'Nous couvrons toutes les principales matières académiques, y compris les mathématiques, la physique, la chimie, la biologie, l\'informatique, les langues, l\'histoire, l\'économie, et plus encore. De nouvelles matières sont ajoutées régulièrement.' 
    },
    { 
      question: 'Puis-je l\'utiliser pour préparer des examens ?', 
      answer: 'Absolument ! Notre plateforme est parfaite pour la préparation aux examens. Vous pouvez vous entraîner avec des quiz adaptatifs, revoir les points faibles et obtenir des explications détaillées sur n\'importe quel sujet.' 
    },
    { 
      question: 'Mes données sont-elles sécurisées ?', 
      answer: 'Oui, nous prenons la sécurité au sérieux. Toutes les données sont cryptées en transit et au repos. Nous ne partageons jamais vos informations personnelles avec des tiers.' 
    },
    { 
      question: 'Puis-je annuler mon abonnement à tout moment ?', 
      answer: 'Oui, vous pouvez annuler votre abonnement à tout moment sans questions. Si vous annulez, vous continuerez à avoir accès jusqu\'à la fin de votre période de facturation.' 
    },
    { 
      question: 'Proposez-vous des remboursements ?', 
      answer: 'Nous offrons une garantie de remboursement de 7 jours pour tous les plans payants. Si vous n\'êtes pas satisfait, contactez notre équipe de support dans les 7 jours suivant votre achat pour un remboursement complet.' 
    },
  ];

  return (
    <section id="faq" className="py-20 lg:py-32 bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
            FAQ
          </span>
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Questions{' '}
            <span className="gradient-text">fréquentes</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Tout ce que vous devez savoir sur notre plateforme de tutorat IA.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-xl border border-border bg-card px-6 data-[state=open]:shadow-md"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
