-- ============================================================
-- MIGRATION SUPABASE — Colonnes manquantes
-- À exécuter dans l'éditeur SQL de Supabase
-- ============================================================

-- 1. Ajouter id_niveau sur la table utilisateur
--    (manquant dans ton schéma actuel mais nécessaire pour l'app)
ALTER TABLE public.utilisateur
    ADD COLUMN IF NOT EXISTS id_niveau integer REFERENCES public.niveau(id_niveau);

-- 2. Ajouter date_modification sur lecon (manquante dans certaines migrations)
ALTER TABLE public.lecon
    ADD COLUMN IF NOT EXISTS date_modification timestamp without time zone DEFAULT CURRENT_TIMESTAMP;

-- 3. Vérifier que personal_access_tokens existe (pour Sanctum)
--    Supabase ne le crée pas automatiquement — Laravel le gère via migration
--    Si la table n'existe pas, lance : php artisan migrate (uniquement pour cette table)

-- 4. (Optionnel) Créer les données initiales pour les rôles
INSERT INTO public.role (nom_role, description)
VALUES
    ('Administrateur', 'Accès complet à la plateforme'),
    ('Élève', 'Étudiant — accès à l''interface apprenant'),
    ('Enseignant', 'Peut créer des cours et évaluations')
ON CONFLICT (nom_role) DO NOTHING;

-- 5. (Optionnel) Créer quelques niveaux
INSERT INTO public.niveau (nom_niveau, description, statut, ordre_affichage, code)
VALUES
    ('Débutant',       'Niveau débutant',       'Actif', 1, 'DEB'),
    ('Intermédiaire',  'Niveau intermédiaire',  'Actif', 2, 'INT'),
    ('Avancé',         'Niveau avancé',         'Actif', 3, 'ADV'),
    ('Expert',         'Niveau expert',         'Actif', 4, 'EXP')
ON CONFLICT (nom_niveau) DO NOTHING;
