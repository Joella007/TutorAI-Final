# On utilise une version légère de PHP
FROM php:8.2-cli

# On installe les extensions nécessaires pour Laravel
RUN apt-get update && apt-get install -y libzip-dev zip unzip git \
    && docker-php-ext-install pdo pdo_mysql zip

# On installe Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# On se place dans le dossier de travail
WORKDIR /app

# On copie tout notre code dans le serveur
COPY . .

# On installe les dépendances (comme le fameux "composer install")
RUN composer install --no-dev --optimize-autoloader

# On donne la commande de démarrage (Celle que Render cherchait !)
CMD php artisan serve --host=0.0.0.0 --port=$PORT