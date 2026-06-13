import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Flame, Clock, Target, TrendingUp, ArrowRight,
  Sparkles, BookOpen, MessageSquare, Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/axios';

// ── Types ──────────────────────────────────────────────────────────────────────
interface CoursEnCours {
  id_cours: number;
  titre: string;
  subject: string;
  icon: string;
  progress: number;
}
interface ChatRecent {
  id_interaction: number;
  question_utilisateur: string;
  date_interaction: string;
}
interface CoursRecommande {
  id_cours: number;
  titre: string;
  description: string;
  chapitre?: { matiere?: { nom_matiere: string } };
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const matiereIcons: Record<string, string> = {
  'Mathématiques':       '🔢',
  'Informatique':        '💻',
  'Physique':            '⚛️',
  'Chimie':              '🧪',
  'Anglais':             '🌍',
  'Français':            '📖',
  'Histoire-Géographie': '🗺️',
  'SVT':                 '🧬',
  'Philosophie':         '🤔',
  'Droit civil':         '⚖️',
  'Comptabilité':        '📊',
  'Microéconomie':       '📈',
  'Algorithmique':       '🔁',
  'Gestion de projet':   '📋',
  'Thermodynamique':     '🌡️',
  'Analyse mathématique':'📐',
  'Espagnol':            '🇪🇸',
  'Allemand':            '🇩🇪',
  'SES':                 '📰',
  'Anatomie':            '🫀',
  'Biochimie':           '⚗️',
  'Marketing':           '📣',
  'Statistiques':        '📊',
  'Communication':       '🗣️',
};

function tempsEcoule(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min  = Math.floor(diff / 60000);
  const h    = Math.floor(min / 60);
  const j    = Math.floor(h / 24);
  if (j > 1)   return `Il y a ${j} jours`;
  if (j === 1)  return 'Hier';
  if (h > 0)   return `Il y a ${h}h`;
  if (min > 0) return `Il y a ${min} min`;
  return 'À l\'instant';
}

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// ── Composant ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [coursEnCours,    setCoursEnCours]    = useState<CoursEnCours[]>([]);
  const [chatsRecents,    setChatsRecents]    = useState<ChatRecent[]>([]);
  const [recommandes,     setRecommandes]     = useState<CoursRecommande[]>([]);
  const [nbCoursInscrits, setNbCoursInscrits] = useState(0);
  const [progressMoyen,   setProgressMoyen]   = useState(0);
  const [isLoading,       setIsLoading]       = useState(true);

  const isNewUser = () => {
    if (!user?.date_creation) return false;
    const created = new Date(user.date_creation);
    const now = new Date();
    return (now.getTime() - created.getTime()) < 5 * 60 * 1000;
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const [coursRes, chatsRes, recommandesRes] = await Promise.allSettled([
          api.get('/user/courses'),
          api.get('/ai/chat/history'),
          api.get('/cours/recommandes'),
        ]);

        if (coursRes.status === 'fulfilled') {
          const enrolled = coursRes.value.data?.data ?? coursRes.value.data ?? [];
          setNbCoursInscrits(enrolled.length);
          if (enrolled.length > 0) {
            const total = enrolled.reduce((sum: number, c: any) => sum + (c.progress ?? 0), 0);
            setProgressMoyen(Math.round(total / enrolled.length));
          }
          const enCours = enrolled
            .sort((a: any, b: any) => (b.progress ?? 0) - (a.progress ?? 0))
            .slice(0, 3)
            .map((c: any) => ({
              id_cours: c.id_cours,
              titre:    c.titre,
              subject:  c.chapitre?.matiere?.nom_matiere ?? 'Cours',
              icon:     matiereIcons[c.chapitre?.matiere?.nom_matiere] ?? '📖',
              progress: c.progress ?? 0,
            }));
          setCoursEnCours(enCours);
        }

        if (chatsRes.status === 'fulfilled') {
          const data = chatsRes.value.data?.data ?? chatsRes.value.data ?? [];
          setChatsRecents(Array.isArray(data) ? data.slice(0, 3) : []);
        }

        if (recommandesRes.status === 'fulfilled') {
          const data = recommandesRes.value.data?.data ?? recommandesRes.value.data ?? [];
          setRecommandes(Array.isArray(data) ? data.slice(0, 3) : []);
        }
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── LOGIQUE POUR LE NIVEAU / CYCLE / FILIERE ──
  const nomFiliere = (user as any)?.filiere?.nom_filiere;
  const nomNiveau  = (user as any)?.niveau?.nom_niveau;
  const nomCycle   = (user as any)?.niveau?.cycle?.nom_cycle;

  let displayLabel = 'Niveau éducatif';
  if (nomFiliere) {
    displayLabel = `Niveau : ${nomNiveau}${nomCycle ? ` (${nomCycle})` : ''}`;
  } else if (nomNiveau) {
    displayLabel = nomCycle ? `Cycle : ${nomCycle}` : 'Votre niveau';
  }

  const stats = [
    {
      label: 'Cours suivis',
      value: nbCoursInscrits,
      unit:  'cours inscrits',
      icon:  BookOpen,
      color: 'text-orange-500 bg-orange-500/10',
    },
    {
      label: 'Progression moyenne',
      value: `${progressMoyen}%`,
      unit:  'sur tous vos cours',
      icon:  TrendingUp,
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      label: 'Conversations IA',
      value: chatsRecents.length,
      unit:  'récentes avec TutorAI',
      icon:  MessageSquare,
      color: 'text-green-500 bg-green-500/10',
    },
    {
      // 👈 MODIFICATION : Utilisation de la nouvelle logique combinée
      label: displayLabel,
      value: nomFiliere || nomNiveau || '—',
      unit:  nomFiliere ? 'Votre classe actuelle' : 'Votre niveau actuel',
      icon:  Target,
      color: 'text-purple-500 bg-purple-500/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        <div className="h-32 rounded-2xl bg-muted animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      {/* Bannière */}
      <motion.div variants={itemVariants} className="rounded-2xl gradient-primary p-6 text-white lg:p-8 shadow-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold lg:text-3xl">
              {isNewUser()
                ? `Bienvenue sur TutorAI, ${user?.prenom} ! 🎉`
                : `Bon retour, ${user?.prenom} ! 👋`
              }
            </h1>
            <p className="mt-2 text-white/80">
              {nbCoursInscrits > 0
                ? `Vous suivez ${nbCoursInscrits} cours · Progression moyenne : ${progressMoyen}%`
                : 'Commencez votre parcours d\'apprentissage dès maintenant !'}
            </p>
          </div>
          <Link to="/courses">
            <Button className="bg-white text-primary hover:bg-white/90 gap-2 shadow-sm font-bold">
              <Sparkles className="h-4 w-4" />
              Commencer à apprendre
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 hover:shadow-lg transition-all border border-border/50">
            <div className={`inline-flex rounded-xl p-3 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            {/* Si c'est la classe, le texte peut être un peu long, on gère ça */}
            <div className={`mt-4 font-bold ${typeof stat.value === 'string' && stat.value.length > 15 ? 'text-xl truncate' : 'text-3xl'}`}>
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">{stat.unit}</div>
            <div className="mt-1 text-sm font-medium">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Continuer l'apprentissage */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Continuer l'apprentissage</h2>
            <Link to="/courses" className="text-sm text-primary hover:underline flex items-center gap-1 font-semibold">
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {coursEnCours.length === 0 ? (
            <div className="mt-4 glass-card p-8 flex flex-col items-center gap-4 text-center border border-border/50">
              <BookOpen className="h-12 w-12 text-muted-foreground opacity-40" />
              <div>
                <p className="font-bold">Aucun cours en cours</p>
                <p className="text-sm text-muted-foreground mt-1">Inscrivez-vous à un cours pour commencer</p>
              </div>
              <Link to="/courses">
                <Button className="gap-2"><BookOpen className="h-4 w-4" />Explorer les cours</Button>
              </Link>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coursEnCours.map((course) => (
                <Link key={course.id_cours} to={`/courses/${course.id_cours}`} className="glass-card-hover group p-5 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-2xl flex-shrink-0 shadow-inner">
                      {course.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate text-[15px]">{course.titre}</h3>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{course.subject}</p>
                    </div>
                  </div>
                  <div className="mt-5">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground font-medium">Progression</span>
                      <span className="font-bold">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                  <Button variant="ghost" size="sm" className="mt-4 w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground font-semibold">
                    <Play className="h-4 w-4" /> Continuer
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Conversations récentes */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Conversations récentes</h2>
            <Link to="/chat" className="text-sm text-primary hover:underline flex items-center gap-1 font-semibold">
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {chatsRecents.length === 0 ? (
              <div className="glass-card p-6 text-center text-muted-foreground border border-border/50">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Aucune conversation pour l'instant</p>
              </div>
            ) : (
              chatsRecents.map((chat) => (
                <Link key={chat.id_interaction} to="/chat" className="glass-card-hover flex items-center gap-4 p-4 border border-border/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-[14px]">{chat.question_utilisateur}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{tempsEcoule(chat.date_interaction)}</p>
                  </div>
                </Link>
              ))
            )}
            <Link to="/chat" className="block pt-2">
              <Button variant="outline" className="w-full gap-2 font-semibold border-primary/20 hover:bg-primary/5 text-primary">
                <Sparkles className="h-4 w-4" /> Nouvelle conversation
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Recommandations selon niveau */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Recommandé pour vous
            {nomNiveau && (
              <span className="ml-2 text-sm font-medium text-muted-foreground">
                — {nomNiveau} {nomCycle ? `(${nomCycle})` : ''}
              </span>
            )}
          </h2>
        </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recommandes.length === 0 ? (
            <div className="col-span-full glass-card p-8 flex flex-col items-center justify-center text-center border border-dashed border-border/60 bg-muted/10">
              <BookOpen className="h-10 w-10 text-muted-foreground opacity-30 mb-3" />
              <p className="font-bold text-foreground">Aucun nouveau cours disponible</p>
              <p className="text-sm text-muted-foreground mt-1">Le programme de cette classe est actuellement en cours de préparation par les professeurs.</p>
            </div>
          ) : (
            recommandes.map((rec) => {
              const matiere = rec.chapitre?.matiere?.nom_matiere ?? '';
              return (
                <Link key={rec.id_cours} to="/courses" className="glass-card-hover flex items-center gap-4 p-4 border border-border/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-2xl flex-shrink-0 shadow-inner">
                    {matiereIcons[matiere] ?? '📖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate text-[14px]">{rec.titre}</h3>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1">{matiere}</p>
                  </div>
                </Link>
              );
            })
          )}
          <Link to="/courses" className="glass-card-hover flex items-center justify-center gap-2 p-4 text-primary border border-primary/20 bg-primary/5">
            <BookOpen className="h-5 w-5" />
            <span className="font-bold">Explorer tous les cours</span>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}