import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    id: 1,
    name: 'Sophie Martin',
    role: 'Lycéenne',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
    rating: 5,
    content: {
      en: 'TutorAI helped me improve my math grades from C to A! The AI explains concepts in a way that just clicks. It\'s like having a patient tutor available whenever I need help.',
      fr: 'TutorAI m\'a aidée à passer de 10 à 18 en maths ! L\'IA explique les concepts d\'une manière qui fait vraiment clic. C\'est comme avoir un tuteur patient disponible à tout moment.',
    },
  },
  {
    id: 2,
    name: 'Thomas Bernard',
    role: 'Étudiant universitaire',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas',
    rating: 5,
    content: {
      en: 'As an engineering student, I use TutorAI for physics and calculus. The step-by-step explanations and practice problems are incredibly helpful for understanding complex topics.',
      fr: 'En tant qu\'étudiant en ingénierie, j\'utilise TutorAI pour la physique et le calcul. Les explications étape par étape et les exercices pratiques sont incroyablement utiles.',
    },
  },
  {
    id: 3,
    name: 'Marie Dubois',
    role: 'Parent',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie',
    rating: 5,
    content: {
      en: 'My daughter\'s confidence in science has skyrocketed since using TutorAI. The progress tracking helps me stay involved in her learning journey.',
      fr: 'La confiance de ma fille en sciences a explosé depuis qu\'elle utilise TutorAI. Le suivi des progrès m\'aide à rester impliquée dans son parcours d\'apprentissage.',
    },
  },
  {
    id: 4,
    name: 'Lucas Petit',
    role: 'Étudiant en médecine',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',
    rating: 5,
    content: {
      en: 'The biology and chemistry modules are excellent. TutorAI breaks down complex biochemical processes into digestible chunks. Essential for my studies!',
      fr: 'Les modules de biologie et chimie sont excellents. TutorAI décompose les processus biochimiques complexes en morceaux digestes. Essentiel pour mes études !',
    },
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-2 text-sm font-medium text-success">
            Témoignages
          </span>
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
            Adoré par les{' '}
            <span className="gradient-text">étudiants du monde entier</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Découvrez ce que les étudiants disent de leur expérience d'apprentissage avec notre tuteur IA.
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative mt-16">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="mx-auto max-w-3xl"
              >
                <div className="glass-card p-8 text-center lg:p-12">
                  {/* Quote Icon */}
                  <Quote className="mx-auto h-12 w-12 text-primary/30" />
                  
                  {/* Rating */}
                  <div className="mt-6 flex items-center justify-center gap-1">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="mt-6 text-lg text-muted-foreground lg:text-xl">
                    "{testimonials[currentIndex].content.fr}"
                  </p>

                  {/* Author */}
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <img
                      src={testimonials[currentIndex].avatar}
                      alt={testimonials[currentIndex].name}
                      className="h-14 w-14 rounded-full bg-muted"
                    />
                    <div className="text-left">
                      <div className="font-semibold">{testimonials[currentIndex].name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonials[currentIndex].role}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Aller au témoignage ${index + 1}`}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8 bg-primary'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={next}
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
