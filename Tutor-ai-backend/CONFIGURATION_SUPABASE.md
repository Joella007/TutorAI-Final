# Configuration de Laravel pour Supabase

## Problème actuel
L'erreur "Impossible de charger les matières" indique que Laravel ne peut pas se connecter à votre base de données Supabase.

## Solution : Configuration de la connexion PostgreSQL

### 1. Vérifier que vous avez les credentials Supabase

Dans votre projet Supabase, allez dans :
- **Settings** → **Database** → **Connection string**
- Ou **Settings** → **API** → **Project API keys**

Vous aurez besoin de :
- **Host** : `db.xxxxx.supabase.co` (ou similaire)
- **Port** : `5432` (par défaut pour PostgreSQL)
- **Database** : `postgres` (par défaut)
- **Username** : `postgres` (ou votre utilisateur)
- **Password** : Votre mot de passe Supabase
- **SSL Mode** : `require` (obligatoire pour Supabase)

### 2. Configurer le fichier `.env` de Laravel

Ouvrez le fichier `.env` dans `mon-backend/` et modifiez les lignes suivantes :

```env
DB_CONNECTION=pgsql
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe_supabase
DB_SSLMODE=require
```

**Important** : Remplacez `xxxxx` et `votre_mot_de_passe_supabase` par vos vraies valeurs.

### 3. Vérifier que l'extension PostgreSQL est installée

Laravel a besoin de l'extension PHP `pdo_pgsql`. Vérifiez avec :

```bash
php -m | grep pgsql
```

Si ce n'est pas installé, installez-le selon votre système :
- **Windows** : Décommentez `extension=pdo_pgsql` dans `php.ini`
- **Linux** : `sudo apt-get install php-pgsql`
- **Mac** : `brew install php-pgsql`

### 4. Tester la connexion

Après avoir configuré le `.env`, testez la connexion :

```bash
php artisan migrate:status
```

Ou testez directement dans Tinker :

```bash
php artisan tinker
>>> DB::connection()->getPdo();
```

### 5. Vérifier les logs Laravel

Si l'erreur persiste, consultez les logs :

```bash
tail -f storage/logs/laravel.log
```

## Alternative : Utiliser la connection string complète

Vous pouvez aussi utiliser la connection string complète dans le `.env` :

```env
DB_CONNECTION=pgsql
DB_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

Remplacez `[PASSWORD]` et `xxxxx` par vos valeurs.

## Vérification finale

Une fois configuré, testez l'endpoint API :

```bash
curl http://localhost:8000/api/matieres
```

Vous devriez recevoir un JSON avec vos matières.
