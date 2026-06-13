import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl gradient-primary p-8 lg:p-16"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 bg-hero-pattern opacity-10" />
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white">
              <Sparkles className="h-4 w-4" />
              Commencer gratuitement
            </div>

            <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Prêt à transformer votre{' '}
              <span className="opacity-90">apprentissage ?</span>
            </h2>

            <p className="mt-4 max-w-2xl text-lg text-white/80">
              Rejoignez des milliers d'étudiants qui apprennent déjà plus intelligemment avec l'IA. Commencez votre essai gratuit aujourd'hui.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg font-semibold shadow-lg"
              >
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <p className="mt-6 text-sm text-white/60">
              Aucune carte de crédit requise
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
