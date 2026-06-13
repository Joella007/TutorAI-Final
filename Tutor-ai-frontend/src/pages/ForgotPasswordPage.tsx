import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/api/axios'; // ✅ Ajouter cet import en haut
// const API_URL = 'http://localhost:8000';
//masque de saisie
import { maskEmail, isEmailValid } from '@/utils/inputMasks';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);

  //   try {
  //     // 1. Récupérer le cookie CSRF de Sanctum
  //     await fetch(`${API_URL}/sanctum/csrf-cookie`, {
  //       method: 'GET',
  //       credentials: 'include',
  //     });

  //     // 2. Envoyer la demande de réinitialisation
  //     const response = await fetch(`${API_URL}/api/forgot-password`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Accept': 'application/json',
  //       },
  //       credentials: 'include',
  //       body: JSON.stringify({ email }),
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       // Laravel renvoie les erreurs de validation dans data.errors
  //       const errorMessage =
  //         data?.errors?.email?.[0] ||
  //         data?.message ||
  //         'Une erreur est survenue.';
  //       throw new Error(errorMessage);
  //     }

  //     setIsSuccess(true);
  //     toast({
  //       title: 'Email envoyé !',
  //       description: 'Vérifiez votre boîte mail pour les instructions.',
  //     });
  //   } catch (error: any) {
  //     toast({
  //       title: 'Erreur',
  //       description: error.message || 'Impossible d\'envoyer l\'email. Réessayez.',
  //       variant: 'destructive',
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post('/forgot-password', { email });

      setIsSuccess(true);
      toast({
        title: 'Email envoyé !',
        description: 'Vérifiez votre boîte mail pour les instructions.',
      });
    } catch (error: any) {
      const msg = error?.response?.data?.errors?.email?.[0]
        ?? error?.response?.data?.message
        ?? 'Impossible d\'envoyer l\'email. Réessayez.';
      toast({
        title: 'Erreur',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-hero-pattern opacity-30" />
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute left-4 top-4 sm:left-8 sm:top-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Button>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-8">
            {/* Logo */}
            <div className="flex flex-col items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </Link>
            </div>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 flex flex-col items-center text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <h2 className="mt-4 text-xl font-semibold">Vérifiez votre e-mail</h2>
                <p className="mt-2 text-muted-foreground">
                  Nous avons envoyé les instructions de réinitialisation du mot de passe à{' '}
                  <strong>{email}</strong>
                </p>
                <Button
                  onClick={() => navigate('/login')}
                  className="mt-6 gradient-primary text-white"
                >
                  Retour à la connexion
                </Button>
              </motion.div>
            ) : (
              <>
                <div className="mt-6 text-center">
                  <h1 className="text-2xl font-bold">Mot de passe oublié ?</h1>
                  <p className="mt-2 text-muted-foreground">
                    Pas de souci, nous vous enverrons les instructions de réinitialisation.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      {/* <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      /> */}
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(maskEmail(e.target.value))}
                        className="pl-10"
                        required
                      />
                      {email && !isEmailValid(email) && (
                        <p className="text-xs text-red-500 mt-1">
                          ❌ Email invalide — exemple : nom@domaine.com
                        </p>
                      )}
                      {email && isEmailValid(email) && (
                        <p className="text-xs text-green-500 mt-1">
                          ✅ Email valide
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full gradient-primary text-white"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Envoi en cours...
                      </span>
                    ) : (
                      'Réinitialiser le mot de passe'
                    )}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Vous vous souvenez de votre mot de passe ?{' '}
                  <Link to="/login" className="text-primary hover:underline">
                    Se connecter
                  </Link>
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}