import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

export function Footer() {
  const footerLinks = {
    'Produit': [
      { label: 'Fonctionnalités', href: '#features' },
      // { label: 'Tarifs', href: '#pricing' },
      { label: 'Comment ça marche', href: '#how-it-works' },
      { label: 'Programmes par classe', href: '#subjects' },
      { label: 'FAQ', href: '#faq' },
      
    ],
    'Entreprise': [
      { label: 'À propos', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Carrières', href: '#' },
      { label: 'Contact', href: '#' },
    ],
    'Légal': [
      { label: 'Confidentialité', href: '#' },
      { label: 'Conditions', href: '#' },
      // { label: 'Cookies', href: '#' },
    ],
  };

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Links Grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">TutorAI</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Accompagner les étudiants du monde entier avec un tutorat personnalisé alimenté par l'IA.
            </p>
            {/* <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div> */}
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold">{title}</h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TutorAI. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground">
              Confidentialité
            </Link>
            <Link to="/terms" className="hover:text-foreground">
              Conditions
            </Link>
            {/* <a href="#" className="hover:text-foreground">Cookies</a> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
