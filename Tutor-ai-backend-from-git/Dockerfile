FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    libzip-dev \
    libpq-dev \
    zip unzip git \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

# Supprimer le .env local — Laravel utilisera les variables Render
RUN rm -f .env

RUN composer install --no-dev --optimize-autoloader

CMD php artisan serve --host=0.0.0.0 --port=$PORT