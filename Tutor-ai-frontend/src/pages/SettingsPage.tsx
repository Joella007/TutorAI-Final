import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Save, Eye, EyeOff, CheckCircle, Camera, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/axios';
import { maskPrenom, maskNom } from '@/utils/inputMasks';
import { Niveau, Cycle } from '@/types/niveau.types';

interface Filiere {
  id_filiere: number;
  nom_filiere: string;
}

const levelIcons: { [key: string]: string } = {
  'Collège':    '📚',
  'Lycée':      '🎓',
  'Université': '🏛️',
};

const reglesMdp = [
  { label: 'Au moins 8 caractères', test: (p: string) => p.length >= 8 },
  { label: 'Une lettre majuscule',  test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Une lettre minuscule',  test: (p: string) => /[a-z]/.test(p) },
  { label: 'Un chiffre',            test: (p: string) => /\d/.test(p) },
  { label: 'Un caractère spécial',  test: (p: string) => /[@$!%*?&_\-#]/.test(p) },
];

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Profil ──
  const [profil, setProfil] = useState({ prenom: '', nom: '', email: '' });
  const [isSavingProfil, setIsSavingProfil] = useState(false);

  // ── Parcours Scolaire ──
  const [isEditingParcours, setIsEditingParcours] = useState(false);
  const [isSavingParcours, setIsSavingParcours]   = useState(false);
  const [parcours, setParcours] = useState({
    idCycle: null as number | null,
    idNiveau: null as number | null,
    idFiliere: null as number | null,
  });
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  
  // NOUVEAU : On empêche la sauvegarde pendant le chargement silencieux
  const [isLoadingFilieres, setIsLoadingFilieres] = useState(false);

  // ── Avatar ──
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // ── Mot de passe ──
  const [mdp, setMdp] = useState({ actuel: '', nouveau: '', confirmation: '' });
  const [showMdp, setShowMdp] = useState({ actuel: false, nouveau: false, confirmation: false });
  const [isSavingMdp, setIsSavingMdp] = useState(false);

  // ── Init User Data ──
  useEffect(() => {
    if (user) {
      setProfil({ prenom: user.prenom ?? '', nom: user.nom ?? '', email: user.email ?? '' });
      setParcours({
        idCycle: (user as any)?.niveau?.id_cycle ?? null,
        idNiveau: user.id_niveau ?? null,
        idFiliere: (user as any)?.id_filiere ?? null,
      });
    }
  }, [user]);

  // ── Chargement des données (Cycles, Niveaux, Filières) ──
  useEffect(() => {
    if (isEditingParcours) {
      api.get('/cycles').then(res => setCycles(res.data?.data ?? res.data ?? []));
    }
  }, [isEditingParcours]);

  useEffect(() => {
    if (parcours.idCycle) {
      api.get('/niveaux', { params: { id_cycle: parcours.idCycle } })
         .then(res => setNiveaux(res.data?.data ?? res.data ?? []));
    } else {
      setNiveaux([]);
    }
  }, [parcours.idCycle]);

  useEffect(() => {
    if (parcours.idNiveau) {
      setIsLoadingFilieres(true);
      api.get('/filieres', { params: { id_niveau: parcours.idNiveau } })
         .then(res => {
            const data = Array.isArray(res.data?.data ?? res.data) ? (res.data?.data ?? res.data) : [];
            setFilieres(data);
            
            // Sécurité : si la nouvelle liste ne contient pas la filière actuellement choisie, on la remet à null
            if (!data.find(f => f.id_filiere === parcours.idFiliere)) {
                setParcours(p => ({ ...p, idFiliere: null }));
            }
         })
         .finally(() => setIsLoadingFilieres(false));
    } else {
      setFilieres([]);
    }
  }, [parcours.idNiveau]);

  // ── Actions ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast({ title: 'Erreur', description: 'Le fichier doit être une image.', variant: 'destructive' });
    if (file.size > 5 * 1024 * 1024) return toast({ title: 'Erreur', description: 'Image trop lourde (max 5 Mo).', variant: 'destructive' });

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file)); 
  };

  const getAvatarSrc = () => {
    if (avatarPreview) return avatarPreview;
    const url = (user as any)?.avatar_url;
    if (url) return url.startsWith('http') ? url : `http://localhost:8000${url}`;
    if (user?.prenom) return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.prenom}`;
    return null;
  };

  const handleSaveProfil = async () => {
    if (!profil.prenom.trim() || !profil.nom.trim() || !profil.email.trim()) {
      return toast({ title: 'Erreur', description: 'Tous les champs sont obligatoires.', variant: 'destructive' });
    }
    setIsSavingProfil(true);
    try {
      const formData = new FormData();
      formData.append('prenom', profil.prenom);
      formData.append('nom', profil.nom);
      formData.append('email', profil.email);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await api.post('/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser({ ...user!, ...(res.data?.data ?? res.data) });
      setAvatarFile(null); setAvatarPreview(null);
      toast({ title: '✅ Profil mis à jour', description: 'Vos informations ont été sauvegardées.' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err?.response?.data?.message ?? 'Erreur lors de la mise à jour.', variant: 'destructive' });
    } finally {
      setIsSavingProfil(false);
    }
  };

  const handleSaveParcours = async () => {
    if (!parcours.idNiveau) return toast({ title: 'Erreur', description: 'Veuillez sélectionner un niveau.', variant: 'destructive' });
    if (filieres.length > 0 && !parcours.idFiliere) return toast({ title: 'Erreur', description: 'Veuillez sélectionner une classe/filière.', variant: 'destructive' });

    setIsSavingParcours(true);
    try {
      const res = await api.post('/profile', {
        id_niveau: parcours.idNiveau,
        id_filiere: filieres.length > 0 ? parcours.idFiliere : null // Si pas de filière (ex: Collège), on envoie null !
      });
      setUser({ ...user!, ...(res.data?.data ?? res.data) });
      setIsEditingParcours(false);
      toast({ title: '✅ Parcours mis à jour', description: 'Votre programme d\'études a été actualisé.' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le parcours.', variant: 'destructive' });
    } finally {
      setIsSavingParcours(false);
    }
  };

  const handleChangeMdp = async () => {
    if (!mdp.actuel || !mdp.nouveau || !mdp.confirmation) return toast({ title: 'Erreur', description: 'Remplissez tous les champs.', variant: 'destructive' });
    if (mdp.nouveau !== mdp.confirmation) return toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas.', variant: 'destructive' });
    if (!reglesMdp.every(r => r.test(mdp.nouveau))) return toast({ title: 'Erreur', description: 'Le mot de passe ne respecte pas les règles.', variant: 'destructive' });

    setIsSavingMdp(true);
    try {
      await api.put('/user/password', { mot_de_passe_actuel: mdp.actuel, mot_de_passe: mdp.nouveau, mot_de_passe_confirmation: mdp.confirmation });
      toast({ title: '✅ Mot de passe modifié', description: 'Votre mot de passe a été mis à jour.' });
      setMdp({ actuel: '', nouveau: '', confirmation: '' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err?.response?.data?.message ?? 'Erreur lors du changement de mot de passe.', variant: 'destructive' });
    } finally {
      setIsSavingMdp(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-8 pb-12">
      
      <div>
        <h1 className="text-3xl font-extrabold">Paramètres</h1>
        <p className="mt-1 text-muted-foreground font-medium">Gérez votre profil et vos préférences.</p>
      </div>

      {/* ── 1. Section Profil ── */}
      <div className="glass-card p-8 space-y-6 shadow-sm border border-border/50">
        <div className="flex items-center gap-4 pb-4 border-b border-border/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shadow-inner">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Informations personnelles</h2>
            <p className="text-sm text-muted-foreground font-medium">Modifiez votre nom, email et photo de profil</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="h-24 w-24 rounded-full bg-muted border-4 border-background shadow-md overflow-hidden flex items-center justify-center">
              {getAvatarSrc() ? <img src={getAvatarSrc()!} alt="Avatar" className="h-full w-full object-cover" /> : <User className="h-10 w-10 text-muted-foreground opacity-50" />}
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <Camera className="h-6 w-6 text-white" />
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/jpg,image/webp" className="hidden" onChange={handleFileChange} />
          
          <div>
            <p className="font-bold text-xl">{profil.prenom} {profil.nom}</p>
            <p className="text-[15px] text-muted-foreground font-medium">{profil.email}</p>
            
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {(user as any)?.niveau?.nom_niveau && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md font-bold tracking-wide">
                  {(user as any).niveau.nom_niveau}
                </span>
              )}
              {(user as any)?.filiere?.nom_filiere && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-accent/10 text-accent-foreground border border-accent/20 px-2.5 py-1 rounded-md font-bold tracking-wide">
                  <GraduationCap className="h-3 w-3" /> {(user as any).filiere.nom_filiere}
                </span>
              )}
            </div>

            <button onClick={() => fileInputRef.current?.click()} className="mt-3 text-sm text-primary hover:text-primary/80 font-bold transition-colors">
              Changer la photo
            </button>
            {avatarFile && <p className="text-xs font-bold text-emerald-500 mt-1">✅ {avatarFile.name} sélectionné</p>}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 pt-2">
          <div className="space-y-2"><label className="text-sm font-bold">Prénom</label><Input value={profil.prenom} onChange={e => setProfil(p => ({ ...p, prenom: maskPrenom(e.target.value) }))} className="h-11 rounded-xl" /></div>
          <div className="space-y-2"><label className="text-sm font-bold">Nom</label><Input value={profil.nom} onChange={e => setProfil(p => ({ ...p, nom: maskNom(e.target.value) }))} className="h-11 rounded-xl" /></div>
        </div>
        <div className="space-y-2"><label className="text-sm font-bold">Email</label><Input type="email" value={profil.email} disabled className="h-11 rounded-xl bg-muted/50 cursor-not-allowed opacity-70" /></div>
        
        <Button onClick={handleSaveProfil} disabled={isSavingProfil} className="gradient-primary text-white gap-2 font-bold h-11 px-6 rounded-xl shadow-md hover:shadow-lg transition-all">
          <Save className="h-4 w-4" /> {isSavingProfil ? 'Sauvegarde...' : 'Sauvegarder le profil'}
        </Button>
      </div>

      {/* ── 2. Section Parcours Scolaire ── */}
      <div className="glass-card p-8 space-y-6 shadow-sm border border-border/50">
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 shadow-inner">
              <GraduationCap className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Parcours scolaire</h2>
              <p className="text-sm text-muted-foreground font-medium">Gérez votre classe et votre niveau d'études</p>
            </div>
          </div>
          {!isEditingParcours && (
            <Button variant="outline" onClick={() => setIsEditingParcours(true)} className="rounded-xl font-bold border-border/60">Modifier</Button>
          )}
        </div>

        {!isEditingParcours ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Cycle</p>
              <p className="font-semibold text-foreground">{(user as any)?.niveau?.cycle?.nom_cycle || 'Non défini'}</p>
            </div>
            <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Niveau</p>
              <p className="font-semibold text-foreground">{user?.niveau?.nom_niveau || 'Non défini'}</p>
            </div>
            <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Classe / Filière</p>
              <p className="font-semibold text-foreground">{(user as any)?.filiere?.nom_filiere || 'Générale'}</p>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 pt-2">
            
            <div className="space-y-3">
              <Label className="font-bold">1. Cycle d'éducation</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {cycles.map((c) => (
                  <button key={c.id_cycle} onClick={() => setParcours({ idCycle: c.id_cycle, idNiveau: null, idFiliere: null })}
                    className={`p-3 rounded-xl border text-sm font-semibold transition-all ${parcours.idCycle === c.id_cycle ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}>
                    {levelIcons[c.nom_cycle] || '📚'} {c.nom_cycle}
                  </button>
                ))}
              </div>
            </div>

            {parcours.idCycle && niveaux.length > 0 && (
              <div className="space-y-3">
                <Label className="font-bold">2. Niveau</Label>
                <div className="grid grid-cols-2 gap-3">
                  {niveaux.map((n) => (
                    <button key={n.id_niveau} onClick={() => setParcours({ ...parcours, idNiveau: n.id_niveau, idFiliere: null })}
                      className={`p-3 rounded-xl border text-sm font-semibold transition-all ${parcours.idNiveau === n.id_niveau ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}>
                      {n.nom_niveau}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 👈 L'ASTUCE EST LÀ : Ce bloc ne s'affiche QUE s'il y a des filières dans la liste ! */}
            <AnimatePresence>
              {parcours.idNiveau && filieres.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden pt-2">
                  <Label className="font-bold">3. Classe / Filière</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {filieres.map((f) => (
                      <button key={f.id_filiere} onClick={() => setParcours({ ...parcours, idFiliere: f.id_filiere })}
                        className={`flex justify-between items-center p-3 rounded-xl border text-sm font-semibold transition-all ${parcours.idFiliere === f.id_filiere ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}>
                        {f.nom_filiere} {parcours.idFiliere === f.id_filiere && <CheckCircle className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSaveParcours} disabled={isSavingParcours || isLoadingFilieres} className="gradient-primary text-white font-bold h-11 px-6 rounded-xl shadow-md">
                <Save className="h-4 w-4 mr-2" /> Enregistrer le parcours
              </Button>
              <Button variant="ghost" onClick={() => setIsEditingParcours(false)} className="h-11 rounded-xl font-bold">Annuler</Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── 3. Section Mot de passe ── */}
      <div className="glass-card p-8 space-y-6 shadow-sm border border-border/50">
        <div className="flex items-center gap-4 pb-4 border-b border-border/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 shadow-inner">
            <Lock className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Sécurité du compte</h2>
            <p className="text-sm text-muted-foreground font-medium">Modifiez votre mot de passe</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">Mot de passe actuel</label>
          <div className="relative">
            <Input type={showMdp.actuel ? 'text' : 'password'} value={mdp.actuel} onChange={e => setMdp(m => ({ ...m, actuel: e.target.value }))} className="h-11 rounded-xl pr-10" />
            <button type="button" onClick={() => setShowMdp(s => ({ ...s, actuel: !s.actuel }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><EyeOff className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">Nouveau mot de passe</label>
          <div className="relative">
            <Input type={showMdp.nouveau ? 'text' : 'password'} value={mdp.nouveau} onChange={e => setMdp(m => ({ ...m, nouveau: e.target.value }))} className="h-11 rounded-xl pr-10" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">Confirmer le mot de passe</label>
          <div className="relative">
            <Input type={showMdp.confirmation ? 'text' : 'password'} value={mdp.confirmation} onChange={e => setMdp(m => ({ ...m, confirmation: e.target.value }))} className="h-11 rounded-xl pr-10" />
          </div>
        </div>

        <Button onClick={handleChangeMdp} disabled={isSavingMdp} variant="outline" className="gap-2 font-bold h-11 px-6 rounded-xl border-border hover:bg-muted/50">
          <Lock className="h-4 w-4" /> Changer le mot de passe
        </Button>
      </div>

    </motion.div>
  );
}