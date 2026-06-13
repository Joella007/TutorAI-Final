import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Play, RotateCcw, CheckCircle, XCircle,
  ChevronRight, Trophy, Target, Clock, BookOpen, AlertCircle, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import api from '@/api/axios';

interface Cours {
  id_cours: number;
  titre: string;
  chapitre?: { matiere?: { nom_matiere: string } };
}

interface QuizQuestion {
  question:    string;
  options:     string[];
  correct:     number;
  explication: string;
}

type Difficulte = 'Facile' | 'Moyen' | 'Difficile';
type EtapeQuiz  = 'config' | 'en_cours' | 'resultat';

const difficulteConfig: Record<Difficulte, { label: string; color: string; bg: string }> = {
  'Facile':    { label: 'Facile',    color: 'text-green-500',  bg: 'bg-green-500/10 border-green-500/30'  },
  'Moyen':     { label: 'Moyen',     color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/30'},
  'Difficile': { label: 'Difficile', color: 'text-red-500',    bg: 'bg-red-500/10 border-red-500/30'      },
};

const matiereIcons: Record<string, string> = {
  'Mathématiques': '🔢', 'Informatique': '💻', 'Physique': '⚛️',
  'Anglais': '🌍', 'Français': '📖', 'Histoire-Géographie': '🗺️',
  'SVT': '🧬', 'Philosophie': '🤔', 'Droit civil': '⚖️',
  'Comptabilité': '📊', 'Algorithmique': '🔁', 'Gestion de projet': '📋',
};

export default function QuizPage() {
  const [etape,          setEtape]          = useState<EtapeQuiz>('config');
  const [cours,          setCours]          = useState<Cours[]>([]);
  const [selectedCours,  setSelectedCours]  = useState<number | null>(null);
  const [nbQuestions,    setNbQuestions]    = useState(5);
  const [difficulte,     setDifficulte]     = useState<Difficulte>('Moyen');
  
  const [questions,      setQuestions]      = useState<QuizQuestion[]>([]);
  const [currentIndex,   setCurrentIndex]   = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered,       setAnswered]       = useState(false);
  const [score,          setScore]          = useState(0);
  const [reponses,       setReponses]       = useState<boolean[]>([]);
  
  const [isLoading,      setIsLoading]      = useState(false);
  const [isLoadingCours, setIsLoadingCours] = useState(true);
  const [tempsDebut,     setTempsDebut]     = useState<Date | null>(null);
  const [tempsFin,       setTempsFin]       = useState<number>(0);
  
  const { toast } = useToast();

  useEffect(() => {
    const fetchCours = async () => {
      try {
        const res = await api.get('/user/courses');
        const data = res.data?.data ?? res.data ?? [];
        setCours(data);
        if (data.length > 0) setSelectedCours(data[0].id_cours);
      } catch {
        toast({ title: 'Erreur', description: 'Impossible de charger vos cours.', variant: 'destructive' });
      } finally {
        setIsLoadingCours(false);
      }
    };
    fetchCours();
  }, []);

  const genererQuiz = async () => {
    if (!selectedCours) return;
    setIsLoading(true);
    try {
      const res = await api.post('/ai/quiz', {
        id_cours:     selectedCours,
        nb_questions: nbQuestions,
        difficulte:   difficulte,
      });

      const rawQuiz = res.data?.quiz;
      const finalQuiz: QuizQuestion[] = Array.isArray(rawQuiz) ? rawQuiz : (rawQuiz?.quiz || []);

      if (!Array.isArray(finalQuiz) || finalQuiz.length === 0) {
        throw new Error('Format de quiz invalide');
      }

      setQuestions(finalQuiz);
      setCurrentIndex(0);
      setScore(0);
      setReponses([]);
      setSelectedAnswer(null);
      setAnswered(false);
      setTempsDebut(new Date());
      setEtape('en_cours');
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Erreur de génération', description: "L'IA n'a pas pu formuler le quiz correctement. Veuillez réessayer.", variant: 'destructive' });
      setEtape('config');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    const correct = index === questions[currentIndex].correct;
    if (correct) setScore(s => s + 1);
    setReponses(prev => [...prev, correct]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      if (tempsDebut) setTempsFin(Math.round((Date.now() - tempsDebut.getTime()) / 1000));
      setEtape('resultat');

      const finalPourcentage = Math.round((score / questions.length) * 100);
      api.post('/ai/quiz/score', {
        id_cours: selectedCours,
        score: score,
        total: questions.length,
        pourcentage: finalPourcentage
      }).catch(err => console.error("Erreur de sauvegarde :", err));

    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    }
  };

  const recommencer = () => {
    setEtape('config');
    setQuestions([]);
    setScore(0);
    setReponses([]);
  };

  const coursSelectionne = cours.find(c => c.id_cours === selectedCours);
  const pourcentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  if (etape === 'config') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><Brain className="h-8 w-8 text-primary" /> Quiz IA</h1>
          <p className="mt-1 text-muted-foreground">Testez vos connaissances sur les cours que vous suivez actuellement.</p>
        </div>

        {isLoadingCours ? (
           <div className="h-64 bg-muted animate-pulse rounded-2xl" />
        ) : cours.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center text-center gap-4 border border-border/50">
            <AlertCircle className="h-12 w-12 text-muted-foreground opacity-40" />
            <h3 className="font-bold text-lg">Vous ne suivez aucun cours</h3>
            <p className="text-muted-foreground text-[15px]">Vous devez d'abord vous inscrire à un cours pour pouvoir générer un Quiz.</p>
            <Link to="/courses"><Button className="mt-2 gradient-primary text-white font-bold"><BookOpen className="h-4 w-4 mr-2"/> Explorer les cours</Button></Link>
          </div>
        ) : (
          <div className="glass-card p-8 space-y-8 shadow-sm border border-border/50">
            
            <div className="space-y-3">
              <label className="text-sm font-bold flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Cours à réviser</label>
              <select
                value={selectedCours ?? ''}
                onChange={(e) => setSelectedCours(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-[15px] font-medium focus:ring-primary shadow-sm"
              >
                {cours.map(c => {
                  const matiere = c.chapitre?.matiere?.nom_matiere ?? 'Général';
                  const icon = matiereIcons[matiere] ?? '📖';
                  return <option key={c.id_cours} value={c.id_cours}>{icon} {matiere} — {c.titre}</option>
                })}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Nombre de questions : <span className="text-primary">{nbQuestions}</span>
              </label>
              <div className="flex gap-3">
                {[3, 5, 7, 10].map(n => (
                  <button
                    key={n} onClick={() => setNbQuestions(n)}
                    className={`flex-1 py-3 rounded-xl border text-[15px] font-bold transition-all shadow-sm ${nbQuestions === n ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40 bg-card'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" /> Difficulté</label>
              <div className="flex gap-3">
                {(['Facile', 'Moyen', 'Difficile'] as Difficulte[]).map(d => {
                  const cfg = difficulteConfig[d];
                  return (
                    <button
                      key={d} onClick={() => setDifficulte(d)}
                      className={`flex-1 py-3 rounded-xl border text-[14px] font-bold tracking-wide transition-all shadow-sm ${difficulte === d ? cfg.bg + ' ' + cfg.color : 'border-border hover:border-primary/40 bg-card text-foreground/80'}`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button onClick={genererQuiz} disabled={!selectedCours || isLoading} className="w-full gradient-primary text-white h-14 text-[16px] font-bold gap-3 shadow-lg hover:shadow-xl hover:opacity-95 transition-all rounded-xl mt-4">
              {isLoading ? (<><Sparkles className="h-5 w-5 animate-spin" /> Génération intelligente en cours...</>) : (<><Play className="h-5 w-5 fill-current" /> Lancer le défi</>)}
            </Button>
          </div>
        )}
      </motion.div>
    );
  }

  // ── Écran quiz en cours ──
  if (etape === 'en_cours' && questions.length > 0) {
    const q = questions[currentIndex];
    
    // ── Sécurité Anti-Crash ──
    if (!q) {
      return (
        <div className="flex flex-col items-center py-24 text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
          <p>La question est introuvable.</p>
          <Button className="mt-4" onClick={recommencer}>Retourner au menu</Button>
        </div>
      );
    }

    const progression = ((currentIndex + (answered ? 1 : 0)) / questions.length) * 100;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Question {currentIndex + 1} / {questions.length}</p>
            <p className="text-xs text-primary font-bold mt-1 bg-primary/10 inline-block px-2 py-0.5 rounded-full">{difficulteConfig[difficulte].label}</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold bg-yellow-500/10 text-yellow-600 px-3 py-1.5 rounded-lg">
            <Trophy className="h-4 w-4 text-yellow-500" /> Score : {score}
          </div>
        </div>

        <div className="h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
          <motion.div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" animate={{ width: `${progression}%` }} transition={{ duration: 0.4 }} />
        </div>

        <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8 space-y-6 shadow-md border border-border/50">
          <h2 className="text-xl font-bold leading-relaxed">{String(q.question)}</h2>
          
          <div className="space-y-3">
            {Array.isArray(q.options) && q.options.map((option, i) => {
              const optStr = String(option);
              let style = 'border-border bg-card hover:border-primary/40 hover:bg-primary/5';
              if (answered) {
                if (i === q.correct) style = 'border-green-500 bg-green-500/10 text-green-700 shadow-sm';
                else if (i === selectedAnswer && i !== q.correct) style = 'border-red-500 bg-red-500/10 text-red-700';
                else style = 'border-border opacity-40 bg-card';
              } else if (selectedAnswer === i) style = 'border-primary bg-primary/10 text-primary shadow-sm';

              return (
                <button
                  key={i} onClick={() => handleAnswer(i)} disabled={answered}
                  className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${style}`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 text-[13px] font-extrabold flex-shrink-0 ${answered && i === q.correct ? 'border-green-500 text-green-600' : 'border-current'}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-[15px] font-medium leading-snug">{optStr}</span>
                  {answered && i === q.correct && <CheckCircle className="ml-auto h-6 w-6 text-green-500 flex-shrink-0" />}
                  {answered && i === selectedAnswer && i !== q.correct && <XCircle className="ml-auto h-6 w-6 text-red-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {answered && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`rounded-xl p-5 border shadow-sm ${selectedAnswer === q.correct ? 'bg-green-500/10 border-green-500/30 text-green-800' : 'bg-red-500/10 border-red-500/30 text-red-800'}`}>
                <p className="font-extrabold mb-2 uppercase tracking-wide text-xs">{selectedAnswer === q.correct ? '✅ Bonne réponse !' : '❌ Mauvaise réponse'}</p>
                <p className="text-[14px] leading-relaxed font-medium">{String(q.explication ?? 'Aucune explication fournie.')}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {answered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button onClick={handleNext} className="w-full gradient-primary text-white gap-2 font-bold h-12 rounded-xl shadow-md hover:shadow-lg transition-all mt-4">
                {currentIndex + 1 >= questions.length ? (<><Trophy className="h-5 w-5" />Voir mes résultats</>) : (<><ChevronRight className="h-5 w-5" />Question suivante</>)}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  // ── Écran résultats ──
  if (etape === 'resultat') {
    const mention =
      pourcentage >= 90 ? { label: 'Excellent !',     emoji: '🏆', color: 'text-yellow-500' } :
      pourcentage >= 70 ? { label: 'Très bien !',      emoji: '🎉', color: 'text-green-500'  } :
      pourcentage >= 50 ? { label: 'Pas mal !',         emoji: '👍', color: 'text-blue-500'   } :
                          { label: 'À retravailler',   emoji: '📚', color: 'text-orange-500' };

    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto space-y-6">
        <div className="glass-card p-10 text-center space-y-4 shadow-lg border border-border/50">
          <div className="text-7xl mb-4">{mention.emoji}</div>
          <h2 className={`text-4xl font-extrabold tracking-tight ${mention.color}`}>{mention.label}</h2>
          <div className="text-7xl font-black text-foreground">{pourcentage}%</div>
          <p className="text-muted-foreground font-medium text-lg">
            {score} bonne{score > 1 ? 's' : ''} réponse{score > 1 ? 's' : ''} sur {questions.length}
          </p>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border/50">
            <div className="text-center bg-green-500/5 py-4 rounded-2xl border border-green-500/10">
              <div className="text-3xl font-black text-green-500">{score}</div>
              <div className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mt-1">Correctes</div>
            </div>
            <div className="text-center bg-red-500/5 py-4 rounded-2xl border border-red-500/10">
              <div className="text-3xl font-black text-red-500">{questions.length - score}</div>
              <div className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mt-1">Incorrectes</div>
            </div>
            <div className="text-center bg-muted/30 py-4 rounded-2xl border border-border/50">
              <div className="text-2xl font-black flex items-center justify-center gap-1.5 text-foreground/80">
                <Clock className="h-5 w-5" />
                {Math.floor(tempsFin / 60)}:{String(tempsFin % 60).padStart(2, '0')}
              </div>
              <div className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mt-2">Temps écoulé</div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={recommencer} variant="outline" className="flex-1 gap-2 h-14 rounded-xl font-bold border-border/60 shadow-sm bg-card hover:bg-muted/50 text-[15px]">
            <RotateCcw className="h-5 w-5 text-muted-foreground" /> Autre Quiz
          </Button>
          <Button onClick={genererQuiz} className="flex-1 gradient-primary text-white gap-2 h-14 rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-[15px]">
            <Play className="h-5 w-5 fill-current" /> Rejouer ce cours
          </Button>
        </div>
      </motion.div>
    );
  }

  // Fallback global de sécurité
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <AlertCircle className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
      <p>Une erreur d'affichage inattendue est survenue.</p>
      <Button className="mt-4" onClick={recommencer}>Retourner au menu</Button>
    </div>
  );
}