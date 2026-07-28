# ============================================================
# Dockerfile — cliend (Drive Portal Client)
# PHP 8.2 + Apache
# ============================================================

FROM php:8.2-apache

# Install PHP extensions required by cliend
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libonig-dev \
    libxml2-dev \
    unzip \
    curl \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite for clean URL routing
RUN a2enmod rewrite

# Configure Apache document root to /public
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN sed -ri -e "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" \
    /etc/apache2/sites-available/*.conf \
 && sed -ri -e "s!/var/www/!${APACHE_DOCUMENT_ROOT}!g" \
    /etc/apache2/apache2.conf \
    /etc/apache2/conf-available/*.conf

# Allow .htaccess overrides
RUN sed -ri -e 's/AllowOverride None/AllowOverride All/g' \
    /etc/apache2/apache2.conf

# Increase PHP upload limits for large files (videos, etc.)
RUN echo "upload_max_filesize = 5G" > /usr/local/etc/php/conf.d/upload.ini \
    && echo "post_max_size = 5G" >> /usr/local/etc/php/conf.d/upload.ini \
    && echo "max_execution_time = 3600" >> /usr/local/etc/php/conf.d/upload.ini \
    && echo "max_input_time = 3600" >> /usr/local/etc/php/conf.d/upload.ini \
    && echo "memory_limit = 512M" >> /usr/local/etc/php/conf.d/upload.ini

# Copy application source code into container
COPY . /var/www/html/

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
 && chmod -R 755 /var/www/html \
 && chmod -R 777 /var/www/html/config

EXPOSE 80
