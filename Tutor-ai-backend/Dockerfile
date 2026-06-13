FROM php:8.2-cli

# Ajout de libpq-dev pour PostgreSQL + pgsql extensions
RUN apt-get update && apt-get install -y \
    libzip-dev \
    libpq-dev \
    zip unzip git \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install --no-dev --optimize-autoloader

# Génère APP_KEY si elle n'existe pas
RUN cp .env.example .env || true
RUN php artisan key:generate --force || true

CMD php artisan serve --host=0.0.0.0 --port=$PORT