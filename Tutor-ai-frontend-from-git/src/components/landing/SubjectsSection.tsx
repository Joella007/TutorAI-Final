import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Library, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const cycles = [
  {
    nom: 'Collège',
    icon: BookOpen,
    color: 'from-green-400 to-emerald-600',
    niveaux: ['Sixième', 'Cinquième', 'Quatrième', 'Troisième'],
    description: 'Renforcez vos bases et préparez le brevet avec des cours interactifs et notre IA.',
    delay: 0,
  },
  {
    nom: 'Lycée',
    icon: GraduationCap,
    color: 'from-blue-400 to-indigo-600',
    niveaux: ['Série Scientifique', 'Série Littéraire', 'Série OSE', 'Toutes les Terminales'],
    description: 'Visez la mention au Baccalauréat avec des QCM générés sur-mesure pour votre filière.',
    delay: 0.2,
  },
  {
    nom: 'Université',
    icon: Library,
    color: 'from-purple-400 to-fuchsia-600',
    niveaux: ['Informatique', 'Droit', 'Médecine', 'Économie', 'Gestion'],
    description: 'Maîtrisez votre domaine d\'expertise universitaire grâce à un tuteur spécialisé.',
    delay: 0.4,
  },
];

export function SubjectsSection() {
  return (
    <section id="subjects" className="py-20 lg:py-32 bg-muted/20 relative overflow-hidden">
      {/* Éléments de décoration en arrière-plan */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Programmes par classe
          </span>
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Un apprentissage adapté à votre <span className="gradient-text">parcours scolaire</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground font-medium">
            TutorAI n'est pas une IA générique. C'est une plateforme qui s'adapte à votre niveau et à votre filière pour vous offrir les cours dont vous avez réellement besoin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {cycles.map((cycle, i) => (
            <motion.div
              key={cycle.nom}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: cycle.delay }}
                className="h-full"
              >
                <div className="glass-card h-full p-8 rounded-3xl border border-border/50 shadow-xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden group">
                  
                  <div className={`absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br ${cycle.color} rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-500`} />

                  <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${cycle.color} shadow-lg mb-6`}>
                    <cycle.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-extrabold mb-3">{cycle.nom}</h3>
                  <p className="text-[15px] text-muted-foreground font-medium leading-relaxed mb-6">
                    {cycle.description}
                  </p>

                  <div className="space-y-3 mb-8">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider">Classes & Filières populaires :</p>
                    <div className="flex flex-wrap gap-2">
                      {cycle.niveaux.map(niv => (
                        <span key={niv} className="bg-muted/50 border border-border/50 text-foreground/80 px-3 py-1.5 rounded-lg text-sm font-semibold">
                          {niv}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link to="/register" className="inline-block mt-auto w-full">
                    <Button variant="outline" className="w-full h-12 rounded-xl font-bold group-hover:border-primary/50 group-hover:text-primary transition-colors">
                      Rejoindre le {cycle.nom} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}