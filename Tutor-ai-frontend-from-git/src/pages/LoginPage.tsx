import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Sparkles, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
//masque de saisie
import { maskEmail, isEmailValid } from '@/utils/inputMasks';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
    
  //   try {
  //     await login({ email, mot_de_passe: password });
  //     toast({
  //       title: 'Bon retour !',
  //       description: 'Connexion réussie.',
  //     });
  //     navigate('/dashboard', { replace: true });
  //   } catch (error) {
  //     toast({
  //       title: 'Erreur',
  //       description: 'Identifiants invalides. Veuillez réessayer.',
  //       variant: 'destructive',
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  //jojo 1
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   // Validation email avant envoi
  //   if (!isEmailValid(email)) {
  //     toast({
  //       title: '📧 Email invalide',
  //       description: 'Veuillez entrer une adresse email valide.',
  //     });
  //     return;
  //   }

  //   setIsLoading(true);

  //   try {
  //     await login({ email, mot_de_passe: password });
  //     toast({
  //       title: 'Bon retour !',
  //       description: 'Connexion réussie.',
  //     });
  //     navigate('/dashboard', { replace: true });
  //   } catch (error: any) {
  //     const message = error?.response?.data?.message ?? '';

  //     if (message.includes('désactivé') || message.includes('inactif') || message.includes('Inactif')) {
  //       toast({
  //         title: '🔒 Compte désactivé',
  //         description: 'Votre compte a été désactivé. Contactez le support.',
  //       });
  //     } else if (message.includes('password') || message.includes('mot de passe') || message.includes('identifiants') || message.includes('Identifiants')) {
  //       toast({
  //         title: '🔑 Mot de passe incorrect',
  //         description: 'Le mot de passe saisi est incorrect. Réessayez.',
  //       });
  //     } else if (message.includes('email') || message.includes('utilisateur') || message.includes('trouvé')) {
  //       toast({
  //         title: '👤 Email introuvable',
  //         description: 'Aucun compte ne correspond à cet email.',
  //       });
  //     } else {
  //       toast({
  //         title: '❌ Connexion échouée',
  //         description: message || 'Une erreur est survenue. Réessayez.',
  //       });
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  //jojo 2

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation email avant envoi
    if (!isEmailValid(email)) {
      toast({
        title: '📧 Email invalide',
        description: 'Veuillez entrer une adresse email valide.',
      });
      return;
    }

    setIsLoading(true);

    try {
      await login({ email, mot_de_passe: password });
      toast({
        title: 'Bon retour !',
        description: 'Connexion réussie.',
      });
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      const message = error?.response?.data?.message ?? '';

      if (message.includes('désactivé') || message.includes('inactif') || message.includes('Inactif')) {
        toast({
          title: '🔒 Compte désactivé',
          description: 'Votre compte a été désactivé. Contactez le support.',
        });
      } else {
        // Couvre : email inexistant, mdp incorrect, les deux incorrects
        toast({
          title: '❌ Identifiants incorrects',
          description: 'Email ou mot de passe invalide. Vérifiez vos informations.',
        });
      }
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
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </motion.div>

        {/* Login Card */}
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
              <h1 className="mt-4 text-2xl font-bold">Bon retour</h1>
              <p className="mt-2 text-muted-foreground">
                Connectez-vous pour continuer votre parcours d'apprentissage
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
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
                    // type="email"
                    type="text"
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

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground">
                    Se souvenir de moi
                  </Label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full gradient-primary text-white"
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              {/* <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou continuer avec</span>
              </div> */}
            </div>

            {/* Social Login */}
            {/* <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" type="button">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" type="button">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </div> */}

            {/* Register Link */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Vous n'avez pas de compte ?{' '}
              <Link to="/register" className="text-primary hover:underline">
                S'inscrire
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
