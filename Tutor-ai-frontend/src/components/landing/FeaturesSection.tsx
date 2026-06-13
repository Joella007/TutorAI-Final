import { motion } from 'framer-motion';
import { MessageSquare, Route, BarChart3, BookOpen, BrainCircuit, Clock } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeaturesSection() {
  const features = [
    {
      icon: MessageSquare,
      title: 'Tuteur IA Dédié',
      description: 'Un blocage ? L\'IA est configurée pour ne parler QUE de votre matière, agissant comme un vrai professeur particulier.',
      color: 'from-primary to-accent',
    },
    {
      icon: Route,
      title: 'Programme sur-mesure',
      description: 'Lycée, Collège ou Université : votre tableau de bord s\'adapte automatiquement aux cours de votre propre classe.',
      color: 'from-accent to-secondary',
    },
    {
      icon: BarChart3,
      title: 'Suivi de Progression',
      description: 'Vos scores de quiz et votre avancement dans les cours sont sauvegardés pour mesurer votre réussite globale.',
      color: 'from-secondary to-success',
    },
    {
      icon: BrainCircuit,
      title: 'Quiz avec Correction IA',
      description: 'Générez des QCM infinis. L\'IA corrige vos réponses en direct et vous explique vos erreurs sans vous faire attendre.',
      color: 'from-success to-primary',
    },
    {
      icon: BookOpen,
      title: 'Cours Interactifs',
      description: 'Lisez les cours préparés pour votre filière, validez les leçons une par une, et posez des questions en un clic.',
      color: 'from-primary to-secondary',
    },
    {
      icon: Clock,
      title: 'Disponible 24h/24',
      description: 'Révisez la veille d\'un examen à 2h du matin : votre tuteur IA ne dort jamais et est toujours prêt à vous aider.',
      color: 'from-accent to-primary',
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Fonctionnalités
          </span>
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
            L'excellence académique à <span className="gradient-text">portée de main</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground font-medium">
            TutorAI combine l'intelligence artificielle de Google avec un suivi scolaire strict pour vous offrir la meilleure plateforme d'apprentissage.
          </p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants} className="group glass-card-hover p-6 border border-border/50">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-inner`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-5 text-xl font-bold">{feature.title}</h3>
              <p className="mt-2 text-[15px] text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}