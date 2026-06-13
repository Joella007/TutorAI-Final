import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Flame, Clock, Target, Trophy, BookOpen,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import api from '@/api/axios';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Progression {
  id_cours: number;
  pourcentage: number;
  date_mise_a_jour: string;
  cours?: {
    titre: string;
    chapitre?: { matiere?: { nom_matiere: string } };
  };
}

// ── Couleurs par matière ───────────────────────────────────────────────────────
const matiereColors: Record<string, string> = {
  'Mathématiques':       'bg-blue-500',
  'Informatique':        'bg-cyan-500',
  'Physique':            'bg-purple-500',
  'Chimie':              'bg-green-500',
  'Anglais':             'bg-yellow-500',
  'Français':            'bg-pink-500',
  'Histoire-Géographie': 'bg-orange-500',
  'SVT':                 'bg-emerald-500',
  'Philosophie':         'bg-indigo-500',
  'Droit civil':         'bg-red-500',
  'Comptabilité':        'bg-teal-500',
  'Algorithmique':       'bg-violet-500',
};

const matiereIcons: Record<string, string> = {
  'Mathématiques': '🔢', 'Informatique': '💻', 'Physique': '⚛️',
  'Chimie': '🧪', 'Anglais': '🌍', 'Français': '📖',
  'Histoire-Géographie': '🗺️', 'SVT': '🧬', 'Philosophie': '🤔',
  'Droit civil': '⚖️', 'Comptabilité': '📊', 'Algorithmique': '🔁',
};

// ── Jours de la semaine ────────────────────────────────────────────────────────
const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function getJoursSemaine(): { day: string; date: Date }[] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return JOURS.map((day, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { day, date: d };
  });
}

export default function ProgressPage() {
  const [progressions,  setProgressions]  = useState<Progression[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/progression');
        const data = res.data?.data ?? res.data ?? [];
        setProgressions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Progression fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Calculs dynamiques ────────────────────────────────────────────────────
  const nbCours        = progressions.length;
  const progressMoyen  = nbCours > 0
    ? Math.round(progressions.reduce((s, p) => s + p.pourcentage, 0) / nbCours)
    : 0;
  const coursTermines  = progressions.filter(p => p.pourcentage >= 100).length;

  // Progression par matière (moyenne)
  const parMatiere: Record<string, { total: number; count: number }> = {};
  progressions.forEach(p => {
    const mat = p.cours?.chapitre?.matiere?.nom_matiere ?? 'Autre';
    if (!parMatiere[mat]) parMatiere[mat] = { total: 0, count: 0 };
    parMatiere[mat].total += p.pourcentage;
    parMatiere[mat].count += 1;
  });
  const subjectProgress = Object.entries(parMatiere).map(([name, val]) => ({
    name,
    progress: Math.round(val.total / val.count),
    color: matiereColors[name] ?? 'bg-gray-500',
    icon:  matiereIcons[name]  ?? '📖',
  })).sort((a, b) => b.progress - a.progress);

  // Activité cette semaine (cours mis à jour par jour)
  const semaine = getJoursSemaine();
  const activiteSemaine = semaine.map(({ day, date }) => {
    const count = progressions.filter(p => {
      if (!p.date_mise_a_jour) return false;
      const d = new Date(p.date_mise_a_jour);
      return d.toDateString() === date.toDateString();
    }).length;
    return { day, count };
  });
  const maxCount = Math.max(...activiteSemaine.map(d => d.count), 1);

  // Cours récents (mis à jour récemment)
  const coursRecents = [...progressions]
    .filter(p => p.date_mise_a_jour)
    .sort((a, b) => new Date(b.date_mise_a_jour).getTime() - new Date(a.date_mise_a_jour).getTime())
    .slice(0, 5);

  function tempsEcoule(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const j = Math.floor(diff / 86400000);
    if (j === 0) return "Aujourd'hui";
    if (j === 1) return 'Hier';
    return `Il y a ${j} jours`;
  }

  const stats = [
    { label: 'Cours suivis',    value: nbCours,       unit: 'inscrits',       icon: BookOpen,   color: 'text-orange-500 bg-orange-500/10' },
    { label: 'Progression',     value: `${progressMoyen}%`, unit: 'moyenne', icon: TrendingUp, color: 'text-blue-500 bg-blue-500/10'   },
    { label: 'Cours terminés',  value: coursTermines, unit: 'complétés',      icon: Target,     color: 'text-green-500 bg-green-500/10'  },
    { label: 'Matières',        value: subjectProgress.length, unit: 'actives', icon: Trophy,   color: 'text-purple-500 bg-purple-500/10'},
  ];

  // ── Skeleton ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="h-64 rounded-xl bg-muted animate-pulse" />
          <div className="h-64 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Ma Progression</h1>
        <p className="mt-1 text-muted-foreground">
          Suivez votre parcours d'apprentissage et mesurez vos progrès.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className={`inline-flex rounded-xl p-3 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="mt-4 text-3xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.unit}</div>
            <div className="mt-1 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Progression globale */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Progression globale</h2>
            <p className="text-sm text-muted-foreground">Moyenne sur tous vos cours</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-2xl font-bold text-white">
            {progressMoyen}%
          </div>
        </div>
        <div className="mt-4">
          <Progress value={progressMoyen} className="h-3" />
          <p className="mt-2 text-sm text-muted-foreground">
            {coursTermines} cours terminé{coursTermines > 1 ? 's' : ''} sur {nbCours}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">

        {/* Activité de la semaine */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Activité cette semaine</h2>
            <span className="text-sm text-muted-foreground">
              {activiteSemaine.reduce((s, d) => s + d.count, 0)} mise{activiteSemaine.reduce((s, d) => s + d.count, 0) > 1 ? 's' : ''} à jour
            </span>
          </div>
          <div className="mt-6 flex items-end justify-between gap-2" style={{ height: '160px' }}>
            {activiteSemaine.map((day, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max((day.count / maxCount) * 100, day.count > 0 ? 15 : 5)}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`w-full rounded-t-lg ${day.count > 0 ? 'gradient-primary' : 'bg-muted'} min-h-[8px]`}
                />
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
          {activiteSemaine.every(d => d.count === 0) && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Aucune activité cette semaine — commencez un cours ! 💪
            </p>
          )}
        </div>

        {/* Progression par matière */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold">Progression par matière</h2>
          {subjectProgress.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <BookOpen className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">Inscrivez-vous à des cours pour voir vos progrès</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {subjectProgress.map((subject, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium flex items-center gap-2">
                      <span>{subject.icon}</span>
                      {subject.name}
                    </span>
                    <span className="text-muted-foreground">{subject.progress}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${subject.progress}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className={`h-full rounded-full ${subject.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cours récents */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold">Cours récemment suivis</h2>
        {coursRecents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Target className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">Aucun cours suivi pour l'instant</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {coursRecents.map((p, i) => {
              const matiere = p.cours?.chapitre?.matiere?.nom_matiere ?? '';
              const couleur = matiereColors[matiere] ?? 'bg-gray-500';
              return (
                <div key={i} className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl ${couleur} flex items-center justify-center text-white text-lg`}>
                      {matiereIcons[matiere] ?? '📖'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{p.cours?.titre ?? `Cours #${p.id_cours}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {matiere} • {p.date_mise_a_jour ? tempsEcoule(p.date_mise_a_jour) : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{p.pourcentage}%</p>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${p.pourcentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </motion.div>
  );
}