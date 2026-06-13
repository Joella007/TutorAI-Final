import { motion } from 'framer-motion';
import { ArrowLeft, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    // Si l'historique du navigateur ne contient que cette page (nouvel onglet)
    if (window.history.length <= 2) {
      window.close(); // Ferme l'onglet
    } else {
      navigate(-1); // Retour classique
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden pb-20">
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary/10 to-transparent" />
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-12">
        <Button variant="ghost" onClick={handleBack} className="mb-8 gap-2 hover:bg-muted font-bold">
          {window.history.length <= 2 ? <><X className="h-4 w-4" /> Fermer la page</> : <><ArrowLeft className="h-4 w-4" /> Retour</>}
        </Button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-12 shadow-xl border border-border/50"
        >
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border/50">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-inner">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Conditions d'utilisation</h1>
              <p className="text-muted-foreground font-medium mt-1">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="space-y-8 text-[15px] leading-relaxed text-foreground/90 font-medium">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">1. Acceptation des conditions</h2>
              <p>En accédant et en utilisant la plateforme TutorAI, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">2. Description du service</h2>
              <p>TutorAI est une plateforme d'apprentissage éducative assistée par Intelligence Artificielle. Le service permet aux étudiants de consulter des cours, de générer des quiz adaptatifs et d'interagir avec un tuteur virtuel spécialisé.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">3. Utilisation de l'Intelligence Artificielle</h2>
              <p className="mb-2">L'utilisateur comprend et accepte que :</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Les réponses générées par le Tuteur IA sont données à titre indicatif et éducatif.</li>
                <li>Des erreurs ou "hallucinations" peuvent survenir. L'utilisateur est invité à faire preuve d'esprit critique.</li>
                <li>Le Tuteur IA ne doit pas être utilisé pour tricher lors d'examens officiels.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">4. Compte utilisateur</h2>
              <p>Vous êtes responsable de la confidentialité de vos identifiants de connexion. Vous vous engagez à fournir des informations exactes lors de votre inscription (Niveau, Filière).</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">5. Propriété intellectuelle</h2>
              <p>Le contenu original de la plateforme (textes des cours, interface, logos) est la propriété de TutorAI. L'utilisation de notre plateforme ne vous confère aucun droit de propriété sur ces éléments.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}