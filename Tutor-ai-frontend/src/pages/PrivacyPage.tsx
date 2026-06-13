import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length <= 2) {
      window.close(); // Ferme l'onglet s'il n'y a pas d'historique
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden pb-20">
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-emerald-500/10 to-transparent" />
      <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-12">
        <Button variant="ghost" onClick={handleBack} className="mb-8 gap-2 hover:bg-muted font-bold">
          {window.history.length <= 2 ? <><X className="h-4 w-4 " /> Fermer la page</> : <><ArrowLeft className="h-4 w-4 " /> Retour</>}
        </Button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-12 shadow-xl border border-border/50"
        >
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border/50">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-inner">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Politique de confidentialité</h1>
              <p className="text-muted-foreground font-medium mt-1">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="space-y-8 text-[15px] leading-relaxed text-foreground/90 font-medium">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">1. Collecte des données</h2>
              <p className="mb-2">Dans le cadre de votre apprentissage sur TutorAI, nous collectons les données suivantes :</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Informations d'identité (Nom, Prénom, Email).</li>
                <li>Parcours scolaire (Cycle, Niveau, Filière/Classe).</li>
                <li>Données d'apprentissage (Progression des cours, scores aux quiz).</li>
                <li>Historique des interactions (Questions posées au tuteur IA et ses réponses).</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">2. Utilisation de vos données</h2>
              <p>Vos données sont exclusivement utilisées pour fournir un service personnalisé. Vos scores et votre progression permettent de vous recommander des cours adaptés. Les historiques de chat nous permettent de maintenir le contexte de vos conversations avec l'IA.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">3. Partage des données (API Google)</h2>
              <p>Pour fournir notre service de tutorat, le texte de vos questions est transmis de manière sécurisée et chiffrée à l'API de Google (Google Gemini). Aucune donnée d'identification personnelle (votre nom ou email) n'est envoyée à l'IA. Nous ne revendons <strong>jamais</strong> vos données à des fins publicitaires.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">4. Vos droits</h2>
              <p>Vous avez le contrôle total de vos données. Vous pouvez à tout moment :</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
                <li>Modifier vos informations depuis les paramètres de votre compte.</li>
                <li>Supprimer manuellement une ou plusieurs conversations avec l'IA depuis l'interface de chat.</li>
                <li>Demander la suppression complète de votre compte en contactant l'administration.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">5. Sécurité</h2>
              <p>Les mots de passe sont hachés de manière sécurisée. Nos serveurs utilisent des protocoles de sécurité modernes pour empêcher tout accès non autorisé à vos données d'apprentissage.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}