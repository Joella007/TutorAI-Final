import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, EyeOff, Sparkles, Mail, Lock, User, ArrowLeft, 
  ArrowRight, Check, GraduationCap, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Niveau, Cycle } from '@/types/niveau.types';
import { maskEmail, isEmailValid, maskPrenom, maskNom } from '@/utils/inputMasks';
import api from '@/api/axios';

interface Filiere {
  id_filiere: number;
  nom_filiere: string;
}

const levelIcons: { [key: string]: string } = {
  'Collège':             '📚',
  'Lycée':               '🎓',
  'Université':          '🏛️',
};

const passwordRules = [
  { label: 'Au moins 8 caractères',      test: (p: string) => p.length >= 8 },
  { label: 'Une lettre majuscule',        test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Une lettre minuscule',        test: (p: string) => /[a-z]/.test(p) },
  { label: 'Un chiffre',                  test: (p: string) => /\d/.test(p) },
  { label: 'Un caractère spécial (@$!%*?&_-#)', test: (p: string) => /[@$!%*?&_\-#]/.test(p) },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email:            '',
    password:         '',
    confirmPassword:  '',
    firstName:        '',
    lastName:         '',
    idCycle:          null as number | null,
    educationLevel:   null as number | null,
    educationLevelName: '' as string,
    idFiliere:        null as number | null,
    acceptTerms:      false,
  });

  const [showPassword, setShowPassword]           = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading]                 = useState(false);
  
  const [niveaux, setNiveaux]                     = useState<Niveau[]>([]);
  const [cycles, setCycles]                       = useState<Cycle[]>([]);
  const [filieres, setFilieres]                   = useState<Filiere[]>([]);
  const [isLoadingFilieres, setIsLoadingFilieres] = useState(false);

  const { register } = useAuth();
  const navigate     = useNavigate();
  const { toast }    = useToast();

  // 1. Charger les cycles au montage
  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const res = await api.get('/cycles');
        const data = res.data?.data ?? res.data ?? [];
        setCycles(Array.isArray(data) ? data : []);
      } catch (error) {
        toast({ title: 'Erreur', description: 'Impossible de charger les cycles.', variant: 'destructive' });
      }
    };
    fetchCycles();
  }, []);

  // 2. Charger les niveaux quand un cycle est sélectionné
  useEffect(() => {
    const fetchNiveaux = async () => {
      if (!formData.idCycle) {
        setNiveaux([]);
        return;
      }
      try {
        const res = await api.get('/niveaux', { params: { id_cycle: formData.idCycle } });
        const data = res.data?.data ?? res.data ?? [];
        setNiveaux(Array.isArray(data) ? data : []);
      } catch (error) {
        toast({ title: 'Erreur', description: 'Impossible de charger les niveaux.', variant: 'destructive' });
      }
    };
    fetchNiveaux();
  }, [formData.idCycle]);

  // 3. Charger les filières/classes quand un niveau est sélectionné
  useEffect(() => {
    const fetchFilieres = async () => {
      if (!formData.educationLevel) {
        setFilieres([]);
        return;
      }
      setIsLoadingFilieres(true);
      try {
        const res = await api.get('/filieres', { params: { id_niveau: formData.educationLevel } });
        const data = res.data?.data ?? res.data ?? [];
        setFilieres(Array.isArray(data) ? data : []);
      } catch (error) {
        toast({ title: 'Erreur', description: 'Impossible de charger les classes.', variant: 'destructive' });
      } finally {
        setIsLoadingFilieres(false);
      }
    };
    fetchFilieres();
  }, [formData.educationLevel]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const passwordValid = passwordRules.every(r => r.test(formData.password));

  const handleSubmit = async () => {
    if (!passwordValid) {
      toast({ title: 'Mot de passe invalide', description: 'Veuillez respecter toutes les règles.', variant: 'destructive' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email:                      formData.email,
        mot_de_passe:               formData.password,
        mot_de_passe_confirmation:  formData.confirmPassword,
        prenom:                     formData.firstName,
        nom:                        formData.lastName,
        id_niveau:                  formData.educationLevel,
        id_filiere:                 formData.idFiliere,
      });

      toast({ title: 'Compte créé !', description: 'Bienvenue sur TutorAI. Commençons à apprendre !' });
      navigate('/dashboard');
    } catch (error: any) {
      const msg = error?.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(' ')
        : 'Échec de la création du compte. Veuillez réessayer.';
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.email && passwordValid && formData.password === formData.confirmPassword;
      case 2:
        return formData.firstName && formData.lastName;
      case 3:
        const isFiliereValid = filieres.length === 0 || formData.idFiliere !== null;
        return formData.idCycle && formData.educationLevel && isFiliereValid && formData.acceptTerms;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      // ── Étape 1 : Email + Mot de passe ──────────────────────────────────
      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Créer votre compte</h2>
              <p className="mt-1 text-sm text-muted-foreground">Entrez votre email et créez un mot de passe</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', maskEmail(e.target.value))}
                    className="pl-10"
                    required
                  />
                  {formData.email && !isEmailValid(formData.email) && (
                    <p className="text-xs text-red-500 mt-1">❌ Email invalide — exemple : nom@domaine.com</p>
                  )}
                  {formData.email && isEmailValid(formData.email) && (
                    <p className="text-xs text-green-500 mt-1">✅ Email valide</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={(e) => updateFormData('password', e.target.value)} className="pl-10 pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                    {passwordRules.map((rule, i) => (
                      <div key={i} className={`flex items-center gap-2 text-xs ${rule.test(formData.password) ? 'text-green-500' : 'text-muted-foreground'}`}>
                        <Check className={`h-3 w-3 ${rule.test(formData.password) ? 'opacity-100' : 'opacity-30'}`} />
                        {rule.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => updateFormData('confirmPassword', e.target.value)} className="pl-10 pr-10" required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-destructive">Les mots de passe ne correspondent pas</p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 && (
                  <p className="text-sm text-green-500 flex items-center gap-1"><Check className="h-3 w-3" /> Les mots de passe correspondent</p>
                )}
              </div>
            </div>
          </motion.div>
        );

      // ── Étape 2 : Prénom + Nom ───────────────────────────────────────────
      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Parlez-nous de vous</h2>
              <p className="mt-1 text-sm text-muted-foreground">Cela nous aide à personnaliser votre expérience</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Marie"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', maskPrenom(e.target.value))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Dupont"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', maskNom(e.target.value))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      // ── Étape 3 : Cycle + Niveau + Filière ──────────────────────────────
      case 3:
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Vos préférences d'apprentissage</h2>
              <p className="mt-1 text-sm text-muted-foreground">Sélectionnez votre parcours</p>
            </div>

            {/* Cycle d'éducation */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Cycle d'éducation
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {cycles.map((cycle) => (
                  <button
                    key={cycle.id_cycle}
                    type="button"
                    onClick={() => {
                      updateFormData('idCycle', cycle.id_cycle);
                      updateFormData('educationLevel', null);
                      updateFormData('educationLevelName', '');
                      updateFormData('idFiliere', null);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-semibold transition-all ${
                      formData.idCycle === cycle.id_cycle
                        ? 'border-primary bg-primary/10 shadow-sm text-primary'
                        : 'border-border hover:border-primary/50 text-foreground/80'
                    }`}
                  >
                    {levelIcons[cycle.nom_cycle] || '📚'}
                    {cycle.nom_cycle}
                  </button>
                ))}
              </div>
            </div>

            {/* Niveau d'éducation */}
            <AnimatePresence>
              {formData.idCycle && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden pt-2">
                  <Label className="flex items-center gap-2">Niveau</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {niveaux.map((level) => (
                      <button
                        key={level.id_niveau}
                        type="button"
                        onClick={() => {
                          updateFormData('educationLevel', level.id_niveau);
                          updateFormData('educationLevelName', level.nom_niveau);
                          updateFormData('idFiliere', null);
                        }}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                          formData.educationLevel === level.id_niveau
                            ? 'border-primary bg-primary/10 shadow-sm text-primary'
                            : 'border-border hover:border-primary/50 text-foreground/80'
                        }`}
                      >
                        <span className="text-2xl">{levelIcons[level.nom_niveau] || '📚'}</span>
                        <span className="text-sm font-semibold">{level.nom_niveau}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filières (Classes) — Ne s'affiche QUE s'il y a des filières pour ce niveau ! */}
            <AnimatePresence>
              {formData.educationLevel && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden pt-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Votre Domaine / Filière
                  </Label>
                  
                  {isLoadingFilieres ? (
                    <div className="h-12 bg-muted animate-pulse rounded-xl w-full" />
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {filieres.map((filiere) => (
                        <button
                          key={filiere.id_filiere}
                          type="button"
                          onClick={() => updateFormData('idFiliere', filiere.id_filiere)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all ${
                            formData.idFiliere === filiere.id_filiere
                              ? 'border-primary bg-primary/10 text-primary shadow-sm'
                              : 'border-border hover:border-primary/50 text-foreground/80'
                          }`}
                        >
                          {filiere.nom_filiere}
                          {formData.idFiliere === filiere.id_filiere && <Check className="h-4 w-4" />}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* CGU */}
            <div className="flex items-start gap-3 pt-6 border-t border-border">
              <Checkbox id="terms" checked={formData.acceptTerms} onCheckedChange={(checked: boolean) => updateFormData('acceptTerms', checked)} className="mt-0.5" />
              <Label htmlFor="terms" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                J'accepte les{' '}
                <Link to="/terms" target="_blank" className="text-primary font-medium hover:underline">Conditions d'utilisation</Link>
                {' '}et la{' '}
                <Link to="/privacy" target="_blank" className="text-primary font-medium hover:underline">Politique de confidentialité</Link>
              </Label>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-hero-pattern opacity-30" />
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
      
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute left-4 top-4 sm:left-8 sm:top-8">
          <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {step > 1 ? 'Retour' : 'Accueil'}
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="glass-card p-8 shadow-xl">
            <div className="flex flex-col items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary shadow-inner">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </Link>
            </div>

            {/* Indicateur de progression */}
            <div className="mt-8 flex justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-2 w-12 rounded-full transition-all duration-300 ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>

            <div className="mt-8">
              <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
            </div>

            <div className="mt-8 flex gap-4">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 h-12 rounded-xl">
                  Précédent
                </Button>
              )}
              <Button
                onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
                disabled={!canProceed() || isLoading}
                className="flex-1 gradient-primary text-white h-12 rounded-xl text-[15px] font-bold shadow-md hover:shadow-lg transition-all"
              >
                {step < 3 ? (
                  <><span>Continuer</span><ArrowRight className="ml-2 h-4 w-4" /></>
                ) : isLoading ? (
                  'Création...'
                ) : (
                  'Créer mon compte'
                )}
              </Button>
            </div>
            
            <p className="mt-6 text-center text-sm text-muted-foreground font-medium">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">Se connecter</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}