import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, MessageSquare, BookOpen, BarChart3, Target,
  Settings, LogOut, Menu, X, Search, Bell,
  Moon, Sun, Sparkles, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

// ── Menu — Planificateur et Réalisations retirés ───────────────────────────────
const sidebarItems = [
  { icon: Home,         label: 'Tableau de bord', path: '/dashboard' },
  { icon: MessageSquare,label: 'Chat Tuteur IA',  path: '/chat'      },
  { icon: BookOpen,     label: 'Mes cours',        path: '/courses'   },
  { icon: BarChart3,    label: 'Progression',      path: '/progress'  },
  { icon: Target,       label: 'Quiz',             path: '/quizzes'      },
  { icon: Settings,     label: 'Paramètres',       path: '/settings'  },
];

export function DashboardLayout() {
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // 👈 NOUVEAU : On stocke la recherche de l'utilisateur
  const [globalSearch, setGlobalSearch] = useState('');
  
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 👈 NOUVEAU : Fonction de recherche qui s'active quand on appuie sur Entrée
  const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && globalSearch.trim() !== '') {
      navigate(`/courses?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  // ── Rendu d'un item de navigation ─────────────────────────────────────────
  const NavItem = ({ item, collapsed, onClick }: {
    item: typeof sidebarItems[0];
    collapsed?: boolean;
    onClick?: () => void;
  }) => {
    const isActive = location.pathname === item.path;
    return (
      <li>
        <Link
          to={item.path}
          onClick={onClick}
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <item.icon className="h-5 w-5 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap font-medium"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </li>
    );
  };

  // ── Section bas sidebar (thème + déconnexion) ──────────────────────────────
  const BottomSection = ({ collapsed }: { collapsed?: boolean }) => (
    <div className="border-t border-border p-4 space-y-1">
      <button
        onClick={toggleTheme}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
      >
        {theme === 'dark'
          ? <Sun  className="h-5 w-5 shrink-0" />
          : <Moon className="h-5 w-5 shrink-0" />
        }
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap font-medium"
            >
              {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all  hover:text-destructive"
      >
        <LogOut className="h-5 w-5 shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap font-medium"
            >
              Déconnexion
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">

      {/* ── Sidebar Desktop ──────────────────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 80 }}
        className="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border bg-card lg:flex"
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shrink-0 shadow-inner">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-xl font-extrabold overflow-hidden whitespace-nowrap"
                >
                  TutorAI
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="shrink-0 text-muted-foreground">
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1.5">
            {sidebarItems.map(item => (
              <NavItem key={item.path} item={item} collapsed={!sidebarOpen} />
            ))}
          </ul>
        </nav>

        <BottomSection collapsed={!sidebarOpen} />
      </motion.aside>

      {/* ── Overlay mobile ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar Mobile ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 z-50 h-screen w-64 flex-col border-r border-border bg-card lg:hidden flex"
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-inner">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-extrabold">TutorAI</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1.5">
                {sidebarItems.map(item => (
                  <NavItem key={item.path} item={item} onClick={() => setMobileMenuOpen(false)} />
                ))}
              </ul>
            </nav>

            <BottomSection />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Contenu principal ─────────────────────────────────────────────────── */}
      <div className={cn('flex-1 transition-all duration-300', sidebarOpen ? 'lg:ml-64' : 'lg:ml-20')}>

        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl lg:px-8">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          {/* 👈 BARRE DE RECHERCHE GLOBALE */}
          <div className="hidden flex-1 max-w-md lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un cours... (Appuyez sur Entrée)" 
                className="pl-10 bg-muted/30 border-transparent focus-visible:bg-background focus-visible:border-primary/50 transition-all font-medium" 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={handleGlobalSearch}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2 hover:bg-muted hover:text-foreground active:bg-muted/80 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-muted overflow-hidden flex items-center justify-center border border-border shrink-0 shadow-sm">
                    {(user as any)?.avatar_url ? (
                      <img
                        src={(user as any).avatar_url}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.prenom ?? 'User'}`}
                        alt="Avatar"
                        className="h-full w-full"
                      />
                    )}
                  </div>
                  <span className="hidden md:inline-block font-semibold ">
                    {user?.prenom} {user?.nom}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 font-medium shadow-xl rounded-xl">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer focus:bg-primary/10 focus:text-primary" >
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer focus:bg-primary/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}