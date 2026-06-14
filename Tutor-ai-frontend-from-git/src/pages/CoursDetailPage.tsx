import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, BookOpen, CheckCircle, Sparkles, ChevronDown, 
  Brain, AlertCircle, Play, FileText, Lightbulb, BookMarked, 
  ChevronRight, RefreshCw, Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import api from '@/api/axios';
import { cn } from '@/lib/utils';

interface Lecon { id_lecon: number; titre: string; contenu: string | null; }
interface Exercice { id_exercice: number; enonce: string; type_exercice: string; difficulte: string; points: number; }
interface Filiere { id_filiere: number; nom_filiere: string; }
interface Cours {
  id_cours: number; titre: string; description: string; niveau: string; duree: string;
  chapitre?: { id_chapitre: number; titre: string; id_filiere?: number; filiere?: Filiere; matiere?: { id: number; name: string; }; lecons: Lecon[]; };
  exercices: Exercice[]; progress?: number; isEnrolled?: boolean;
}

const niveauColors: Record<string, string> = {
  Collège: 'bg-green-500/20 text-green-400 border-green-500/30',
  Lycée: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Université: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Vie professionnelle': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const matiereGradients: Record<string, string> = {
  Mathématiques: 'from-blue-600 to-purple-700', Physique: 'from-orange-500 to-pink-600',
  Informatique: 'from-cyan-500 to-blue-600', Anglais: 'from-yellow-500 to-orange-500',
  Français: 'from-pink-500 to-rose-600', Philosophie: 'from-indigo-500 to-purple-600',
  'Droit civil': 'from-red-500 to-pink-600', Droit: 'from-rose-500 to-red-600',
  Comptabilité: 'from-teal-500 to-cyan-600', Microéconomie: 'from-green-500 to-emerald-600',
  Économie: 'from-lime-500 to-green-600', SVT: 'from-emerald-500 to-green-700',
  Algorithmique: 'from-violet-500 to-purple-600', 'Gestion de projet': 'from-amber-500 to-orange-600',
  Gestion: 'from-sky-500 to-blue-600', Malagasy: 'from-red-500 to-orange-600',
  Chimie: 'from-green-500 to-teal-600', Biologie: 'from-emerald-500 to-green-600',
  'Histoire-Géographie': 'from-amber-500 to-orange-600', Sociologie: 'from-purple-500 to-pink-600',
};

const difficulteBadge: Record<string, string> = {
  Facile: 'bg-green-500/20 text-green-400', Moyen: 'bg-yellow-500/20 text-yellow-400', Difficile: 'bg-red-500/20 text-red-400',
};

const leconIcons: Record<string, string[]> = {
  Algorithmique: ['ti-topology-star-3', 'ti-git-branch', 'ti-route', 'ti-arrows-shuffle', 'ti-chart-dots', 'ti-binary-tree'],
  Mathématiques: ['ti-math-function', 'ti-vector-triangle', 'ti-calculator', 'ti-sigma', 'ti-infinity', 'ti-chart-line'],
  Informatique: ['ti-cpu', 'ti-code', 'ti-database', 'ti-network', 'ti-terminal', 'ti-binary'],
  Physique: ['ti-atom', 'ti-wave-sine', 'ti-magnet', 'ti-bolt', 'ti-temperature', 'ti-telescope'],
  default: ['ti-book-2', 'ti-file-text', 'ti-bulb', 'ti-pencil', 'ti-star', 'ti-target'],
};

function getLeconIcon(matiere: string, index: number): string {
  const icons = leconIcons[matiere] ?? leconIcons['default'];
  return icons[index % icons.length];
}

function normalizeProgress(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

const FormattedText = ({ content }: { content: string }) => {
  if (!content) return null;
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

  return (
    <div className="flex flex-col gap-3">
      {lines.map((line, index) => {
        const isBullet = line.startsWith('- ') || line.startsWith('* ');
        const renderBold = (text: string) => {
          return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
            }
            return part;
          });
        };

        if (isBullet) {
          const cleanText = line.substring(2).trim();
          return (
            <div key={index} className="flex gap-2.5 ml-4 mt-0.5">
              <div className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0 opacity-80" />
              <div className="text-[15px] leading-relaxed text-foreground/90">{renderBold(cleanText)}</div>
            </div>
          );
        }

        if (line.length > 350) {
          const sentences = line.split('. ');
          const blocks = [];
          let currentBlock = '';
          sentences.forEach((s, i) => {
            const sWithDot = i === sentences.length - 1 ? s : s + '.';
            currentBlock += (currentBlock ? ' ' : '') + sWithDot;
            if (currentBlock.length > 250 || i === sentences.length - 1) {
              blocks.push(currentBlock);
              currentBlock = '';
            }
          });
          return (
            <div key={index} className="flex flex-col gap-3 mt-1">
              {blocks.map((b, bIndex) => <p key={bIndex} className="text-[15px] leading-relaxed text-foreground/90">{renderBold(b)}</p>)}
            </div>
          );
        }
        return <p key={index} className="text-[15px] leading-relaxed text-foreground/90 mt-1">{renderBold(line)}</p>;
      })}
    </div>
  );
};

function parseLeconContenu(contenu: string) {
  const raw = contenu.trim();
  const paragraphs = raw.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return { intro: raw, detail: '', resume: '', complexites: [] };

  const intro = paragraphs[0];
  const last = paragraphs[paragraphs.length - 1];
  const resume = paragraphs.length > 1 && last.length <= 400 ? last : '';

  const complexites: { label: string; valeur: string }[] = [];
  paragraphs.forEach((p) => {
    const matches = p.match(/O\([^)]+\)/g);
    if (matches) {
      matches.forEach((m) => {
        const labelMatch = p.match(/([^.:\n]+?)\s*[:\-–]\s*O\(/);
        const label = labelMatch ? labelMatch[1].trim().slice(0, 60) : 'Complexité';
        if (!complexites.find((c) => c.valeur === m)) complexites.push({ label, valeur: m });
      });
    }
  });

  const detailParagraphs = paragraphs.length > 2 ? paragraphs.slice(1, resume ? -1 : undefined) : paragraphs.length === 2 && !resume ? [paragraphs[1]] : [];
  return { intro, detail: detailParagraphs.join('\n\n'), resume, complexites };
}

export default function CoursDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [cours, setCours] = useState<Cours | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [expandedLecon, setExpandedLecon] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'lecons' | 'exercices'>('lecons');
  const [error, setError] = useState('');
  
  // États pour les exercices
  const [reponses, setReponses] = useState<Record<number, string>>({});
  const [corrections, setCorrections] = useState<Record<number, { loading: boolean; text?: string }>>({});

  const fetchProgress = async (coursId: number) => {
    const progressRes = await api.get(`/cours/${coursId}/progress`).catch(() => null);
    const payload = progressRes?.data;
    return normalizeProgress(payload?.progress ?? payload?.pourcentage ?? payload?.progression ?? payload?.data?.progress ?? payload?.data?.pourcentage ?? payload?.data?.progression ?? 0);
  };

  useEffect(() => {
    let mounted = true;
    const fetchCourseData = async () => {
      if (!id) { setError('Cours introuvable.'); setIsLoading(false); return; }
      try {
        setIsLoading(true);
        const res = await api.get(`/cours/${id}`);
        const data = res.data?.data ?? res.data;
        const progress = await fetchProgress(data.id_cours);
        if (!mounted) return;
        setCours({ ...data, progress });
      } catch {
        if (mounted) setError('Cours introuvable.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchCourseData();
    return () => { mounted = false; };
  }, [id]);

  if (isLoading) return <div className="space-y-6 animate-pulse"><div className="h-64 rounded-2xl bg-muted" /></div>;
  if (error || !cours) return <div className="flex flex-col items-center justify-center py-24 text-center"><AlertCircle className="h-16 w-16 text-muted-foreground opacity-40 mb-4" /><h2 className="text-xl font-semibold">Cours introuvable</h2><Button className="mt-6" onClick={() => navigate('/courses')}><ArrowLeft className="h-4 w-4 mr-2" />Retour</Button></div>;

  const matiere = cours.chapitre?.matiere?.name ?? '';
  const filiere = cours.chapitre?.filiere?.nom_filiere ?? '';
  const gradient = matiereGradients[matiere] ?? 'from-violet-600 to-indigo-700';
  const lecons = cours.chapitre?.lecons ?? [];
  const exercices = cours.exercices ?? [];

  const updateCourseProgress = async (newProgress: number) => {
    if (!cours || newProgress <= (cours.progress ?? 0)) return;
    setCours(prev => prev ? { ...prev, progress: newProgress } : prev);
    try { await api.put(`/cours/${cours.id_cours}/progress`, { progress: newProgress, pourcentage: newProgress, progression: newProgress }); } catch {}
  };

  const handleStartOrContinue = async () => {
    if (lecons.length === 0) return;
    setIsStarting(true);
    setActiveTab('lecons');
    
    const currentProgress = cours?.progress ?? 0;
    if (currentProgress === 100) {
      setExpandedLecon(lecons[0].id_lecon);
      setTimeout(() => document.getElementById(`lecon-${lecons[0].id_lecon}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
      setIsStarting(false);
      return;
    }
    
    let targetIndex = 0;
    for (let i = 0; i < lecons.length; i++) {
      if (currentProgress < Math.round(((i + 1) / lecons.length) * 100)) { targetIndex = i; break; }
    }

    setExpandedLecon(lecons[targetIndex].id_lecon);
    setTimeout(() => document.getElementById(`lecon-${lecons[targetIndex].id_lecon}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);

    if (currentProgress === 0) await updateCourseProgress(1);
    setIsStarting(false);
  };

  // ── CORRECTION EN DIRECT DE L'EXERCICE ──
  const validerExercice = async (ex: Exercice) => {
    const rep = reponses[ex.id_exercice];
    if (!rep) return;

    setCorrections(prev => ({ ...prev, [ex.id_exercice]: { loading: true } }));

    try {
      const payload = {
        message: `Voici ma réponse pour l'exercice : "${rep}". Est-ce correct ?`,
        id_cours: cours.id_cours,
        id_exercice: ex.id_exercice,
        with_history: false 
      };
      
      const res = await api.post('/ai/chat', payload);
      const data = res.data?.data ?? res.data;
      
      setCorrections(prev => ({ 
        ...prev, 
        [ex.id_exercice]: { loading: false, text: data.ai_response } 
      }));
    } catch (err) {
      setCorrections(prev => ({ 
        ...prev, 
        [ex.id_exercice]: { loading: false, text: "Erreur lors de la correction par l'IA." } 
      }));
      toast({ title: 'Erreur', description: 'Impossible de joindre le Tuteur IA.', variant: 'destructive' });
    }
  };

  const renderExerciceContent = (ex: Exercice) => {
    const parts = ex.enonce.split(/(?=\b[a-eA-E]\))/);
    const question = parts[0];
    const options = parts.slice(1);
    const isQCM = options.length >= 2 || ex.type_exercice?.toUpperCase() === 'QCM';
    
    const isLocked = corrections[ex.id_exercice]?.text !== undefined;
    const isLoading = corrections[ex.id_exercice]?.loading;

    return (
      <div className="space-y-3 mt-2 w-full">
        <p className="text-[15px] text-foreground/90 font-medium mb-3 leading-relaxed">{question}</p>
        
        {isQCM && options.length >= 2 ? (
          <div className="flex flex-col gap-2 mb-3">
            {options.map((opt, oIndex) => {
              const optText = opt.trim();
              const isSelected = reponses[ex.id_exercice] === optText;
              
              let btnStyle = "border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-foreground/80";
              if (isSelected) {
                 btnStyle = "border-primary bg-primary/10 text-primary font-semibold shadow-sm";
              } else if (isLocked) {
                 btnStyle = "border-border bg-muted/30 text-muted-foreground opacity-60";
              }

              return (
                <button
                  key={oIndex}
                  disabled={isLocked}
                  onClick={() => {
                    setReponses(p => ({ ...p, [ex.id_exercice]: optText }));
                    setCorrections(p => ({ ...p, [ex.id_exercice]: undefined as any })); 
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 text-sm leading-relaxed",
                    btnStyle,
                    isLocked ? "cursor-not-allowed" : "cursor-pointer"
                  )}
                >
                  {optText}
                </button>
              );
            })}
          </div>
        ) : (
          <textarea
            value={reponses[ex.id_exercice] || ''}
            disabled={isLocked}
            onChange={(e) => {
              setReponses(p => ({ ...p, [ex.id_exercice]: e.target.value }));
              setCorrections(p => ({ ...p, [ex.id_exercice]: undefined as any }));
            }}
            placeholder="Tapez votre réponse détaillée ici..."
            className={cn(
               "w-full min-h-[120px] mb-3 p-3.5 rounded-xl border border-border bg-card focus:border-primary outline-none transition-all resize-y text-sm text-foreground/90 shadow-sm",
               isLocked && "opacity-70 bg-muted/20 cursor-not-allowed"
            )}
          />
        )}

        {!isLocked && (
          <Button 
            onClick={() => validerExercice(ex)}
            disabled={!reponses[ex.id_exercice] || isLoading}
            className={`w-full sm:w-auto gap-2 text-sm h-10 px-5 font-medium shadow-sm bg-gradient-to-r ${gradient} text-white hover:opacity-90`}
          >
            {isLoading ? (
              <><Sparkles className="h-3.5 w-3.5 animate-spin" /> Analyse...</>
            ) : (
              <><CheckCircle className="h-3.5 w-3.5" /> Valider ma réponse</>
            )}
          </Button>
        )}

        <AnimatePresence>
          {corrections[ex.id_exercice]?.text && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden pt-3">
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="font-bold text-primary text-[11px] uppercase tracking-wider">Correction du Tuteur IA</span>
                </div>
                <FormattedText content={corrections[ex.id_exercice].text!} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
      <button onClick={() => navigate('/courses')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
        <ArrowLeft className="h-4 w-4" /> Retour aux cours
      </button>

      <div className={`relative rounded-3xl bg-gradient-to-br ${gradient} p-8 text-white overflow-hidden shadow-sm`}>
        <div className="relative z-10">
          <div className="flex flex-wrap gap-2 mb-4">
            {matiere && <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-sm">{matiere}</span>}
            {filiere && <span className="rounded-full bg-white/30 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-sm border border-white/30">🎓 {filiere}</span>}
          </div>
          <h1 className="text-3xl font-bold lg:text-4xl tracking-tight">{cours.titre}</h1>
          <p className="mt-3 text-white/90 max-w-3xl text-[15px] leading-relaxed">{cours.description}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 rounded-xl bg-muted/50 p-1 border border-border/50">
              <button onClick={() => setActiveTab('lecons')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', activeTab === 'lecons' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>📖 Leçons ({lecons.length})</button>
              <button onClick={() => setActiveTab('exercices')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', activeTab === 'exercices' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>🧠 Exercices ({exercices.length})</button>
            </div>
          </div>

          {activeTab === 'lecons' && (
            <div className="space-y-3">
              {lecons.map((lecon, index) => {
                const isExpanded = expandedLecon === lecon.id_lecon;
                const progress = cours.progress ?? 0;
                const isDone = progress >= Math.round(((index + 1) / lecons.length) * 100);
                const isActive = !isDone && (index === 0 || progress >= Math.round((index / lecons.length) * 100));
                const parsed = lecon.contenu ? parseLeconContenu(lecon.contenu) : null;

                return (
                  <motion.div id={`lecon-${lecon.id_lecon}`} key={lecon.id_lecon} className={cn('scroll-mt-6', isExpanded && 'sm:col-span-2')}>
                    <div className="glass-card overflow-hidden transition-all duration-200 shadow-sm border border-border/60">
                      <div className={cn('h-1 w-full', isDone ? 'bg-emerald-500' : isActive ? `bg-gradient-to-r ${gradient}` : 'bg-border')} />
                      <button onClick={() => setExpandedLecon(isExpanded ? null : lecon.id_lecon)} className="w-full text-left p-4 flex items-start gap-4">
                        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', isDone ? 'bg-emerald-500/15' : isActive ? 'bg-primary/10' : 'bg-muted')}>
                          {isDone ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <BookOpen className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="font-semibold text-[15px] text-foreground">{lecon.titre}</p>
                          {!isExpanded && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">Leçon {index + 1} sur {lecons.length}</p>}
                        </div>
                        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform shrink-0 mt-1', isExpanded && 'rotate-180')} />
                      </button>
                      <AnimatePresence>
                        {isExpanded && lecon.contenu && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            
                            {/* ── C'EST ICI LA MODIFICATION MAJEURE POUR L'AFFICHAGE DU CONTENU ── */}
                            <div className="border-t border-border/50 px-5 py-5 lg:px-6 lg:py-6">
                              
                              {parsed?.resume && (
                                <div className={cn('mb-6 rounded-2xl p-5 flex gap-4', `bg-gradient-to-br ${gradient} bg-opacity-10`)} style={{ background: 'var(--color-bg-card, oklch(var(--primary)/0.08))' }}>
                                  <div className="shrink-0 mt-1"><BookMarked className="h-5 w-5 text-primary" /></div>
                                  <div>
                                    <p className="text-sm font-extrabold text-primary uppercase tracking-wider mb-2">À retenir</p>
                                    <FormattedText content={parsed.resume} />
                                  </div>
                                </div>
                              )}

                              {parsed?.intro && (
                                <div className="mb-5">
                                  <FormattedText content={parsed.intro} />
                                </div>
                              )}

                              {parsed?.detail && (
                                <div className="mb-5">
                                  <FormattedText content={parsed.detail} />
                                </div>
                              )}

                              {/* On affiche TOUT le contenu si le parseur IA n'a rien détecté (ex: copier/coller manuel) */}
                              {(!parsed || (!parsed.intro && !parsed.detail)) && (
                                <FormattedText content={lecon.contenu} />
                              )}

                            </div>

                            <div className="px-5 py-3 lg:px-6 lg:py-4 bg-muted/10 border-t border-border/50 flex items-center justify-between">
                              <Link to={`/chat?cours_id=${cours.id_cours}&lecon_id=${lecon.id_lecon}`}>
                                <Button variant="outline" size="sm" className="gap-2 text-xs font-bold shadow-sm">
                                  <Sparkles className="h-4 w-4 text-primary" />
                                  Poser une question
                                </Button>
                              </Link>
                              <button onClick={() => updateCourseProgress(Math.round(((index + 1) / lecons.length) * 100))} className="text-primary font-bold text-sm flex items-center gap-2 hover:text-primary/80 transition-colors">
                                Terminer cette leçon <CheckCircle className="h-4 w-4" />
                              </button>
                            </div>

                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {activeTab === 'exercices' && (
            <div className="space-y-4">
              {exercices.map((ex, i) => (
                <div key={ex.id_exercice} className="glass-card p-5 lg:p-6 flex flex-col lg:flex-row items-start gap-4 lg:gap-5 shadow-sm border border-border/60">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[15px] font-bold bg-gradient-to-br ${gradient} text-white`}>{i + 1}</div>
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap gap-2 mb-2">
                        {ex.type_exercice && <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase">{ex.type_exercice}</span>}
                        {ex.difficulte && <span className={cn('text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase', difficulteBadge[ex.difficulte] ?? 'bg-muted text-muted-foreground')}>{ex.difficulte}</span>}
                        {ex.points && <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-bold uppercase">{ex.points} pts</span>}
                    </div>
                    {renderExerciceContent(ex)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="glass-card p-5 space-y-5 shadow-sm border border-border/50">
            <div className="flex items-center gap-2 text-emerald-500"><CheckCircle className="h-5 w-5" /><span className="font-semibold text-foreground">Progression</span></div>
            <div>
              <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Achèvement</span><span className="font-semibold text-foreground">{cours.progress ?? 0}%</span></div>
              <div className="h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`} style={{ width: `${cours.progress ?? 0}%` }} /></div>
            </div>
            <Button onClick={handleStartOrContinue} className={`w-full h-11 text-[15px] font-medium bg-gradient-to-r ${gradient} text-white shadow-sm`}>
              <Play className="h-4 w-4 mr-2" /> {(cours.progress ?? 0) === 100 ? 'Réviser le cours' : 'Continuer le cours'}
            </Button>
          </div>
          
          <div className="glass-card p-5 space-y-4 shadow-sm border border-border/50">
            <h3 className="font-semibold text-[15px]">Informations</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Durée', value: cours.duree },
                { label: 'Leçons', value: lecons.length },
                { label: 'Exercices', value: exercices.length },
                { label: 'Matière', value: matiere || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center"><span className="text-muted-foreground">{label}</span><span className="font-medium text-foreground/90">{value}</span></div>
              ))}
            </div>
          </div>

          <Link to={`/chat?cours_id=${cours.id_cours}`}>
            <div className="glass-card p-5 hover:shadow-md transition-all cursor-pointer group border border-border/50">
              <div className="flex items-center gap-3 mb-3"><div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}><Sparkles className="h-5 w-5 text-white" /></div><h3 className="font-semibold">Besoin d'aide ?</h3></div>
              <p className="text-sm text-muted-foreground">Discutez librement de ce cours avec votre Tuteur IA personnel.</p>
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}