import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Sparkles, BookOpen, Brain, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

const floatingIcons = [
  { icon: BookOpen, className: 'top-20 left-[10%] text-primary', delay: 0 },
  { icon: Brain, className: 'top-40 right-[15%] text-accent', delay: 0.2 },
  { icon: Trophy, className: 'bottom-32 left-[20%] text-secondary', delay: 0.4 },
  { icon: Sparkles, className: 'bottom-20 right-[10%] text-success', delay: 0.6 },
];

export function HeroSection() {
  const navigate = useNavigate();

  const stats = [
    // { value: '50K+', label: 'Étudiants actifs' },
    // { value: '1M+', label: 'Questions répondues' },
    // { value: '98%', label: 'Taux de satisfaction' },
    // { value: '24/7', label: 'Disponibilité' },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden pt-24">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-pattern opacity-50" />
      <div className="absolute inset-0 gradient-hero" />
      
      {/* Gradient Orbs */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

      {/* Floating Icons */}
      {floatingIcons.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ delay: item.delay, duration: 0.8 }}
          className={`absolute hidden lg:block ${item.className}`}
        >
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, delay: item.delay }}
          >
            <item.icon className="h-12 w-12 opacity-40" />
          </motion.div>
        </motion.div>
      ))}

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Plateforme d'apprentissage IA</span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl"
          >
            Votre tuteur{' '}
            <span className="gradient-text">IA personnel</span>{' '}
            disponible 24h/24
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Maîtrisez n'importe quelle matière avec un tutorat IA personnalisé. Obtenez des explications instantanées, entraînez-vous avec des quiz adaptatifs et suivez vos progrès en temps réel.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="gradient-primary text-white px-8 py-6 text-lg font-semibold shadow-lg hover:opacity-90 hover:shadow-xl transition-all"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {/* <Button
              size="lg"
              variant="outline"
              className="group px-8 py-6 text-lg font-semibold"
            >
              <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              Voir la démo
            </Button> */}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Hero Image/Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 w-full max-w-5xl"
          >
            <div className="relative rounded-2xl border border-border/50 bg-card/50 p-2 shadow-2xl backdrop-blur-sm">
              {/* Mock Dashboard Preview */}
              <div className="aspect-video rounded-xl bg-gradient-to-br from-muted to-muted/50 p-6">
                <div className="flex h-full flex-col">
                  {/* Mock Header */}
                  <div className="flex items-center justify-between border-b border-border/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl gradient-primary" />
                      <div className="h-4 w-32 rounded-full bg-border" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 rounded-lg bg-border" />
                      <div className="h-8 w-8 rounded-lg bg-border" />
                    </div>
                  </div>
                  
                  {/* Mock Content */}
                  <div className="mt-4 flex flex-1 gap-4">
                    {/* Sidebar */}
                    <div className="hidden w-48 space-y-3 md:block">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-border" />
                          <div className="h-3 w-24 rounded-full bg-border" />
                        </div>
                      ))}
                    </div>
                    
                    {/* Main Area */}
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="rounded-xl bg-background/50 p-4">
                            <div className="h-3 w-16 rounded-full bg-border" />
                            <div className="mt-2 h-6 w-20 rounded-full bg-primary/30" />
                          </div>
                        ))}
                      </div>
                      <div className="h-32 rounded-xl bg-background/50" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Chat Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="absolute -right-4 bottom-8 hidden w-72 rounded-2xl border border-border bg-card p-4 shadow-xl lg:block"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-success border-2 border-card" />
                  </div>
                  <div>
                    <div className="font-semibold">Tuteur IA</div>
                    <div className="text-xs text-muted-foreground">En ligne</div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    Comment puis-je vous aider aujourd'hui ? 📚
                  </div>
                  <div className="ml-auto w-fit rounded-lg gradient-primary p-3 text-sm text-white">
                    Explique les équations du second degré
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
