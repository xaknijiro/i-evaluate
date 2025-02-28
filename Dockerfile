FROM php:8.3.2-apache

RUN apt-get update && \
    apt-get install -y zip && \
    apt-get install -y mariadb-client && \
    apt-get install -y npm && \
    apt-get install -y libfreetype6-dev libjpeg62-turbo-dev libpng-dev && \
    apt-get autoclean

RUN docker-php-ext-install bcmath

RUN docker-php-ext-install ctype

RUN docker-php-ext-install pdo

RUN docker-php-ext-install pdo_mysql

RUN docker-php-ext-install sockets

RUN docker-php-ext-configure gd --with-freetype=/usr/include/ --with-jpeg=/usr/include/ && \
    docker-php-ext-install gd

RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"

RUN php -r "if (hash_file('sha384', 'composer-setup.php') === 'dac665fdc30fdd8ec78b38b9800061b4150413ff2e3b6f88543c636f7cd84f6db9189d43a81e5503cda447da73c7e5b6') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"

RUN php composer-setup.php

RUN php -r "unlink('composer-setup.php');"

RUN mv composer.phar /usr/local/bin/composer

RUN a2enmod rewrite

ENV NVM_VERSION=master

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh | bash

RUN nvm install --lts | bash

RUN nvm use --lts | bash

RUN npm install -g npm-check-updates

WORKDIR /var/www/html

RUN git config --global --add safe.directory /var/www/html | bash