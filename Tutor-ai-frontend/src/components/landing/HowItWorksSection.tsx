import { motion } from 'framer-motion';
import { UserPlus, Route, TrendingUp, ArrowRight } from 'lucide-react'; // 👈 Changement d'icône

export function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: UserPlus,
      title: 'Créez votre compte',
      description: 'Inscrivez-vous en quelques secondes avec votre email. C\'est simple et totalement gratuit pour commencer.',
    },
    {
      number: '02',
      icon: Route, // 👈 Nouvelle icône
      title: 'Sélectionnez votre parcours', // 👈 Nouveau texte
      description: 'Collège, Lycée ou Université : indiquez votre classe. L\'IA s\'adaptera instantanément à votre programme officiel.',
    },
    {
      number: '03',
      icon: TrendingUp,
      title: 'Commencez à apprendre',
      description: 'Faites des quiz, lisez vos cours exclusifs et discutez avec votre tuteur IA pour booster votre moyenne !',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
            Comment ça marche
          </span>
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Démarrez en {' '}
            <span className="gradient-text">trois étapes simples</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Rejoindre TutorAI est rapide et facile. Suivez ces étapes pour commencer votre parcours d'apprentissage personnalisé.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative"
            >
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-16 hidden h-0.5 w-full bg-gradient-to-r from-primary/50 to-transparent lg:block" />
              )}
              <div className="relative flex flex-col items-center text-center">
                <div className="absolute -top-4 right-0 lg:right-auto lg:left-0 text-6xl font-black text-muted/30">
                  {step.number}
                </div>
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/20">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="mt-6 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 max-w-xs text-muted-foreground font-medium">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="mt-6 h-6 w-6 text-primary lg:hidden" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}