import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/api/axios';

const passwordRules = [
  { label: 'Au moins 8 caractères',            test: (p: string) => p.length >= 8            },
  { label: 'Une lettre majuscule',              test: (p: string) => /[A-Z]/.test(p)          },
  { label: 'Une lettre minuscule',              test: (p: string) => /[a-z]/.test(p)          },
  { label: 'Un chiffre',                        test: (p: string) => /\d/.test(p)             },
  { label: 'Un caractère spécial (@$!%*?&_-#)', test: (p: string) => /[@$!%*?&_\-#]/.test(p) },
];

export default function ResetPasswordPage() {
  const [searchParams]   = useSearchParams();
  const navigate         = useNavigate();
  const { toast }        = useToast();

  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [mdp,          setMdp]          = useState({ nouveau: '', confirmation: '' });
  const [showMdp,      setShowMdp]      = useState({ nouveau: false, confirmation: false });
  const [isLoading,    setIsLoading]    = useState(false);
  const [isSuccess,    setIsSuccess]    = useState(false);

  const passwordValid = passwordRules.every(r => r.test(mdp.nouveau));

  // Rediriger si pas de token
  useEffect(() => {
    if (!token || !email) {
      toast({ title: 'Lien invalide', description: 'Ce lien de réinitialisation est invalide.', variant: 'destructive' });
      navigate('/forgot-password');
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValid) {
      toast({ title: 'Mot de passe invalide', description: 'Respectez toutes les règles.', variant: 'destructive' });
      return;
    }
    if (mdp.nouveau !== mdp.confirmation) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/reset-password', {
        token,
        email,
        mot_de_passe:              mdp.nouveau,
        mot_de_passe_confirmation: mdp.confirmation,
      });

      setIsSuccess(true);
      toast({ title: '✅ Mot de passe réinitialisé', description: 'Vous pouvez maintenant vous connecter.' });

      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.email?.[0]
        ?? err?.response?.data?.message
        ?? 'Erreur lors de la réinitialisation.';
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-hero-pattern opacity-30" />
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute left-4 top-4 sm:left-8 sm:top-8">
          <Button variant="ghost" onClick={() => navigate('/login')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="glass-card p-8">
            <div className="flex flex-col items-center">
              <Link to="/">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </Link>
            </div>

            {isSuccess ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="mt-4 text-xl font-semibold">Mot de passe réinitialisé !</h2>
                <p className="mt-2 text-muted-foreground">Redirection vers la connexion dans 3 secondes...</p>
                <Button onClick={() => navigate('/login')} className="mt-6 gradient-primary text-white">
                  Se connecter maintenant
                </Button>
              </motion.div>
            ) : (
              <>
                <div className="mt-6 text-center">
                  <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
                  <p className="mt-2 text-muted-foreground">
                    Choisissez un nouveau mot de passe pour <strong>{email}</strong>
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  {/* Nouveau mot de passe */}
                  <div className="space-y-2">
                    <Label>Nouveau mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type={showMdp.nouveau ? 'text' : 'password'}
                        value={mdp.nouveau}
                        onChange={e => setMdp(m => ({ ...m, nouveau: e.target.value }))}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        required
                      />
                      <button type="button" onClick={() => setShowMdp(s => ({ ...s, nouveau: !s.nouveau }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showMdp.nouveau ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Règles mot de passe */}
                    {mdp.nouveau && (
                      <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                        {passwordRules.map((rule, i) => (
                          <div key={i} className={`flex items-center gap-2 text-xs ${rule.test(mdp.nouveau) ? 'text-green-500' : 'text-muted-foreground'}`}>
                            <CheckCircle className={`h-3 w-3 ${rule.test(mdp.nouveau) ? 'opacity-100' : 'opacity-30'}`} />
                            {rule.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirmation */}
                  <div className="space-y-2">
                    <Label>Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type={showMdp.confirmation ? 'text' : 'password'}
                        value={mdp.confirmation}
                        onChange={e => setMdp(m => ({ ...m, confirmation: e.target.value }))}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        required
                      />
                      <button type="button" onClick={() => setShowMdp(s => ({ ...s, confirmation: !s.confirmation }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showMdp.confirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {mdp.confirmation && mdp.nouveau && (
                      <p className={`text-xs mt-1 ${mdp.nouveau === mdp.confirmation ? 'text-green-500' : 'text-red-500'}`}>
                        {mdp.nouveau === mdp.confirmation ? '✅ Les mots de passe correspondent' : '❌ Ne correspondent pas'}
                      </p>
                    )}
                  </div>

                  <Button type="submit" disabled={isLoading || !passwordValid || mdp.nouveau !== mdp.confirmation} className="w-full gradient-primary text-white">
                    {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                  </Button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}