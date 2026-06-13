import { useState, useEffect } from 'react';
import type { MouseEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Grid, List, Clock, BookOpen, SearchX, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/axios';

interface Matiere { id?: number; id_matiere?: number; name?: string; nom_matiere?: string; }
interface Filiere { id_filiere: number; nom_filiere: string; id_niveau: number; }
interface Cours {
  id_cours: number; titre: string; description: string; niveau: string; duree: string; date_creation: string;
  chapitre?: { id_chapitre: number; titre: string; id_matiere: number; id_filiere?: number; filiere?: Filiere; matiere?: { id: number; name: string; }; };
  progress?: number; isEnrolled?: boolean;
}

const matiereColors: Record<string, string> = {
  Mathématiques: 'from-blue-500 to-purple-600', Physique: 'from-orange-400 to-pink-500',
  Chimie: 'from-green-400 to-teal-500', Informatique: 'from-cyan-400 to-blue-500',
  Biologie: 'from-emerald-400 to-green-600', 'Histoire-Géographie': 'from-amber-400 to-orange-500',
  Anglais: 'from-yellow-400 to-orange-400', Français: 'from-pink-400 to-rose-500',
  SVT: 'from-green-500 to-emerald-600', Philosophie: 'from-indigo-400 to-purple-500',
  'Droit civil': 'from-red-400 to-pink-500', Comptabilité: 'from-teal-400 to-cyan-500',
  Algorithmique: 'from-violet-400 to-purple-500', Microéconomie: 'from-green-400 to-emerald-500',
  'Gestion de projet': 'from-amber-400 to-orange-500', Malagasy: 'from-red-500 to-orange-500',
  Économie: 'from-lime-400 to-green-500', Droit: 'from-rose-400 to-red-500',
  Gestion: 'from-sky-400 to-blue-500', Sociologie: 'from-purple-400 to-pink-500',
};

const matiereIcons: Record<string, string> = {
  Mathématiques: '🔢', Physique: '⚛️', Chimie: '🧪', Informatique: '💻',
  Biologie: '🧬', 'Histoire-Géographie': '🗺️', Anglais: '🌍', Français: '📖',
  SVT: '🧫', Philosophie: '🤔', 'Droit civil': '⚖️', Comptabilité: '📊',
  Algorithmique: '🔁', Microéconomie: '📈', 'Gestion de projet': '📋',
  Malagasy: '🇲🇬', Économie: '💹', Droit: '⚖️', Gestion: '🏢', Sociologie: '👥',
};

const niveauColors: Record<string, string> = {
  Collège: 'bg-green-500/20 text-green-400',
  Lycée: 'bg-blue-500/20 text-blue-400',
  Université: 'bg-purple-500/20 text-purple-400',
  'Vie professionnelle': 'bg-orange-500/20 text-orange-400',
};

export default function CoursPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams(); // 👈 Écoute de l'URL

  const [cours, setCours] = useState<Cours[]>([]);
  const [filtered, setFiltered] = useState<Cours[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filterMatiere, setFilterMatiere] = useState('Toutes');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [matieres, setMatieres] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCours, setTotalCours] = useState(0);
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);

  const nomNiveau = (user as any)?.niveau?.nom_niveau ?? '';
  const idNiveau = (user as any)?.id_niveau;
  const idFiliere = (user as any)?.id_filiere;
  
  // 👈 Mot-clé tapé dans la barre du haut
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    let mounted = true;
    const fetchMatieresDisponibles = async () => {
      try {
        const params: Record<string, string | number> = {};
        if (idNiveau) params.id_niveau = idNiveau;
        if (idFiliere) params.id_filiere = idFiliere;
        
        const res = await api.get('/matieres/disponibles', { params });
        if (!mounted) return;
        
        const matieresRaw = res.data?.data ?? res.data ?? [];
        const matiereNames = [...new Set(matieresRaw.map((m: Matiere) => m.name ?? m.nom_matiere).filter(Boolean) as string[])];
        
        setMatieres(matiereNames);
        if (filterMatiere !== 'Toutes' && !matiereNames.includes(filterMatiere)) {
          setFilterMatiere('Toutes');
          setPage(1);
        }
      } catch {
        if (mounted) { setMatieres([]); setFilterMatiere('Toutes'); }
      }
    };
    fetchMatieresDisponibles();
    return () => { mounted = false; };
  }, [idNiveau, idFiliere, filterMatiere]);

  useEffect(() => {
    let mounted = true;
    const fetchCours = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const params: Record<string, string | number> = { page, per_page: 12 };
        if (idNiveau) params.id_niveau = idNiveau;
        if (idFiliere) params.id_filiere = idFiliere;
        if (filterMatiere !== 'Toutes') params.matiere = filterMatiere;
        if (searchQuery) params.search = searchQuery; // 👈 Envoi de la recherche au backend !

        const [coursRes, enrolledRes] = await Promise.all([
          api.get('/cours', { params }),
          api.get('/user/courses').catch(() => null),
        ]);

        if (!mounted) return;

        const coursData: Cours[] = coursRes.data?.data ?? [];
        const enrolled: any[] = enrolledRes?.data?.data ?? enrolledRes?.data ?? [];
        const progressByCourse = new Map<number, number>();

        enrolled.forEach((e: any) => {
          const idC = Number(e.id_cours ?? e.cours?.id_cours ?? e.id);
          const progress = Number(e.progress ?? e.pourcentage ?? 0);
          if (idC) progressByCourse.set(idC, progress);
        });

        const merged = coursData.map((c) => {
          const progress = progressByCourse.get(c.id_cours);
          return progress !== undefined ? { ...c, isEnrolled: true, progress } : { ...c, isEnrolled: false };
        });

        setCours(merged);
        setFiltered(merged);
        setLastPage(coursRes.data?.meta?.last_page ?? 1);
        setTotalCours(coursRes.data?.meta?.total ?? merged.length);
        
      } catch {
        setError('Impossible de charger les cours. Vérifiez votre connexion.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchCours();
    return () => { mounted = false; };
  }, [page, idNiveau, idFiliere, filterMatiere, searchQuery]);

  const handleEnroll = async (idCours: number, e: MouseEvent) => {
    e.stopPropagation();
    if (enrollingCourseId !== null) return;
    try {
      setEnrollingCourseId(idCours);
      await api.post(`/user/courses/${idCours}/enroll`);
      setCours((prev) => prev.map((c) => c.id_cours === idCours ? { ...c, isEnrolled: true, progress: 0 } : c));
      navigate(`/courses/${idCours}`);
    } catch (err: any) {
      if (err?.response?.status === 409) navigate(`/courses/${idCours}`); 
      else setEnrollingCourseId(null);
    }
  };

  const clearSearch = () => {
    setSearchParams({}); // Vide l'URL
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="h-40 bg-muted animate-pulse" />
              <div className="p-4 space-y-3"><div className="h-5 bg-muted animate-pulse rounded w-3/4" /><div className="h-4 bg-muted animate-pulse rounded w-full" /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive font-semibold">{error}</p>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Programme d'études</h1>
        <p className="mt-2 text-muted-foreground font-medium text-[15px]">
          {nomNiveau ? `Cours exclusifs de votre classe — ${nomNiveau}` : 'Explorez votre programme scolaire.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 flex-wrap justify-between items-center">
        <div className="flex items-center gap-3">
          <select
            value={filterMatiere}
            onChange={(e) => { setFilterMatiere(e.target.value); setPage(1); }}
            className="h-12 w-64 rounded-xl border border-border/60 bg-card px-4 font-semibold text-sm text-foreground shadow-sm focus:ring-primary focus:border-primary"
          >
            <option value="Toutes">Filtrer par matière (Toutes)</option>
            {matieres.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          
          {/* 👈 NOUVEAU : Indicateur de recherche avec bouton d'annulation */}
          {searchQuery && (
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-lg ml-2">
              <span className="text-sm font-bold">Recherche : "{searchQuery}"</span>
              <button onClick={clearSearch} className="hover:bg-primary/20 p-1 rounded-md transition-colors"><XCircle className="h-4 w-4" /></button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm font-bold text-muted-foreground bg-muted/30 px-4 py-2.5 rounded-xl border border-border/50">
            {totalCours} cours trouvé{totalCours > 1 ? 's' : ''}
          </div>
          <div className="flex gap-1 border border-border/60 rounded-xl p-1 bg-card shadow-sm h-12">
            <button onClick={() => setViewMode('grid')} className={`flex items-center justify-center w-10 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}><Grid className="h-4 w-4" /></button>
            <button onClick={() => setViewMode('list')} className={`flex items-center justify-center w-10 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}><List className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center border border-dashed border-border rounded-3xl bg-muted/10">
          <SearchX className="h-16 w-16 text-muted-foreground opacity-30 mb-2" />
          <div>
            <p className="font-bold text-xl text-foreground">Aucun cours trouvé</p>
            <p className="text-muted-foreground mt-2 font-medium">Nous n'avons trouvé aucun cours correspondant à {searchQuery ? `la recherche "${searchQuery}"` : "cette matière"}.</p>
          </div>
          {(filterMatiere !== 'Toutes' || searchQuery) && (
            <Button variant="outline" onClick={() => { setFilterMatiere('Toutes'); clearSearch(); }} className="mt-4 font-bold h-11 px-6 rounded-xl border-border/60">
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((c) => {
            const matiere = c.chapitre?.matiere?.name ?? 'Cours';
            const gradient = matiereColors[matiere] ?? 'from-gray-500 to-gray-700';
            const icon = matiereIcons[matiere] ?? '📖';
            const niveauCls = niveauColors[c.niveau] ?? 'bg-muted text-muted-foreground';
            const isEnrolling = enrollingCourseId === c.id_cours;

            return (
              <div key={c.id_cours} onClick={() => navigate(`/courses/${c.id_cours}`)} className="rounded-3xl border border-border/50 bg-card overflow-hidden cursor-pointer hover:border-primary/40 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                <div className={`relative h-44 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md">{icon}</span>
                  {c.niveau && <span className={`absolute top-4 right-4 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md shadow-sm ${niveauCls}`}>{c.niveau}</span>}
                  {c.isEnrolled && <span className="absolute top-4 left-4 text-[11px] font-extrabold px-3 py-1 rounded-full bg-primary text-white shadow-sm uppercase tracking-wider">Inscrit</span>}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">{matiere}</p>
                  <h3 className="font-extrabold text-lg group-hover:text-primary transition-colors line-clamp-2 leading-snug">{c.titre}</h3>
                  <p className="text-[14px] text-muted-foreground mt-2.5 line-clamp-2 leading-relaxed flex-grow">{c.description}</p>
                  <div className="mt-6 pt-5 border-t border-border/50 flex flex-col gap-4">
                    {c.isEnrolled && c.progress !== undefined ? (
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1.5"><span className="text-muted-foreground">Progression</span><span className="text-primary">{c.progress}%</span></div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden shadow-inner"><div className="h-full bg-primary rounded-full" style={{ width: `${c.progress}%` }} /></div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground"><Clock className="h-4 w-4" /> {c.duree}</div>
                    )}
                    <Button size="sm" className={`w-full h-11 rounded-xl font-bold shadow-sm ${c.isEnrolled ? 'bg-muted hover:bg-muted/80 text-foreground border border-border' : 'gradient-primary text-white hover:opacity-90'}`} disabled={isEnrolling} onClick={(e) => { e.stopPropagation(); if (c.isEnrolled) navigate(`/courses/${c.id_cours}`); else handleEnroll(c.id_cours, e); }}>
                      {isEnrolling ? 'Inscription...' : c.isEnrolled ? '▶ Continuer le cours' : "S'inscrire au cours"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => {
            const matiere = c.chapitre?.matiere?.name ?? 'Cours';
            const icon = matiereIcons[matiere] ?? '📖';
            const gradient = matiereColors[matiere] ?? 'from-gray-500 to-gray-700';
            const isEnrolling = enrollingCourseId === c.id_cours;

            return (
              <div key={c.id_cours} onClick={() => navigate(`/courses/${c.id_cours}`)} className="flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-2xl border border-border/50 bg-card p-5 cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-inner`}><span className="text-3xl drop-shadow-sm">{icon}</span></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1"><p className="text-[11px] font-bold text-primary uppercase tracking-wider">{matiere}</p></div>
                  <h3 className="font-extrabold text-lg truncate">{c.titre}</h3>
                  <p className="text-[15px] text-muted-foreground truncate mt-1">{c.description}</p>
                  {c.isEnrolled && c.progress !== undefined && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden shadow-inner"><div className="h-full bg-primary rounded-full" style={{ width: `${c.progress}%` }} /></div>
                      <span className="text-xs font-bold text-primary">{c.progress}%</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-0 border-border/50 mt-2 sm:mt-0">
                  {c.duree && !c.isEnrolled && <span className="text-sm font-bold text-muted-foreground flex items-center gap-1.5"><Clock className="h-4 w-4" />{c.duree}</span>}
                  <Button size="sm" className={`h-11 px-6 rounded-xl font-bold w-full sm:w-auto shadow-sm ${c.isEnrolled ? 'bg-muted hover:bg-muted/80 text-foreground border border-border' : 'gradient-primary text-white hover:opacity-90'}`} disabled={isEnrolling} onClick={(e) => { e.stopPropagation(); if (c.isEnrolled) navigate(`/courses/${c.id_cours}`); else handleEnroll(c.id_cours, e); }}>
                    {isEnrolling ? 'Inscription...' : c.isEnrolled ? 'Continuer' : "S'inscrire"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-border/50">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="h-11 rounded-xl font-bold border-border/60 shadow-sm">Précédent</Button>
          <span className="text-sm font-extrabold text-muted-foreground bg-muted/30 px-4 py-2 rounded-lg border border-border/50">Page {page} / {lastPage}</span>
          <Button variant="outline" disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(lastPage, p + 1))} className="h-11 rounded-xl font-bold border-border/60 shadow-sm">Suivant</Button>
        </div>
      )}
    </div>
  );
}