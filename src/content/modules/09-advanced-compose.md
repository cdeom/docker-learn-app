---
title: "Docker Compose Avancé"
description: "Healthchecks, profiles, scaling et bonnes pratiques Compose"
order: 9
duration: "30 min"
icon: "⚡"
xpReward: 250
objectives:
  - "Configurer des healthchecks et dépendances"
  - "Utiliser les profiles et overrides"
  - "Maîtriser le scaling et les extensions YAML"
---

# Docker Compose Avancé

Maintenant qu'on maîtrise les bases de Docker Compose, on va explorer des fonctionnalités plus poussées qui te permettront de créer des applications vraiment robustes et professionnelles.

## 9.1 Healthchecks dans Compose

### Le problème avec les conteneurs "démarrés"

Imagine : ton conteneur PostgreSQL démarre, Docker dit "OK c'est bon !", mais en réalité la base de données met encore 5 secondes à être vraiment prête à accepter des connexions. Si ton application web se lance en même temps, elle va planter en essayant de se connecter.

C'est là qu'interviennent les **healthchecks** : ils permettent à Docker de vérifier que ton service n'est pas juste démarré, mais vraiment **fonctionnel**.

### Anatomie d'un healthcheck

Un healthcheck est composé de plusieurs paramètres :

- **test** : la commande qui vérifie que tout va bien
- **interval** : toutes les combien on lance le test (ex: toutes les 30s)
- **timeout** : temps max pour que le test réponde
- **retries** : nombre d'échecs avant de marquer le service comme "unhealthy"
- **start_period** : temps de grâce au démarrage (le test peut échouer sans conséquence)

### Exemples concrets

#### Healthcheck pour une API web

```yaml
services:
  web:
    image: nginx:alpine
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Si tu n'as pas `curl` dans ton image, tu peux utiliser `wget` :

```yaml
test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80/health"]
```

Ou même un simple test TCP :

```yaml
test: ["CMD-SHELL", "nc -z localhost 80 || exit 1"]
```

#### Healthcheck pour PostgreSQL

PostgreSQL vient avec un outil dédié : `pg_isready`

```yaml
services:
  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: secret123
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
```

#### Healthcheck pour MySQL

MySQL utilise `mysqladmin` :

```yaml
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: secret123
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p$$MYSQL_ROOT_PASSWORD"]
      interval: 10s
      timeout: 5s
      retries: 3
```

#### Healthcheck pour Redis

```yaml
services:
  cache:
    image: redis:alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
```

### Voir l'état de santé

Une fois lancé, tu peux vérifier l'état :

```bash
docker compose ps
```

Tu verras dans la colonne "Status" :

- `(healthy)` : tout va bien !
- `(health: starting)` : en cours de vérification
- `(unhealthy)` : le service a raté trop de tests

Tu peux aussi inspecter les détails :

```bash
docker inspect --format='{{json .State.Health}}' nom_du_conteneur | jq
```

## 9.2 depends_on avec condition: service_healthy

### Le problème avec depends_on basique

Par défaut, `depends_on` dit juste à Docker : "attends que le conteneur de la base démarre avant de lancer l'app". Mais **démarrer ≠ être prêt** !

```yaml
# ❌ Problématique : l'app va probablement crasher
services:
  web:
    build: .
    depends_on:
      - database  # attend juste que le conteneur démarre

  database:
    image: postgres:15
```

### La solution : condition: service_healthy

Combiné avec un healthcheck, tu peux dire : "attends que la base soit **vraiment prête**" !

```yaml
services:
  web:
    build: .
    depends_on:
      database:
        condition: service_healthy  # attend que le healthcheck passe ✅

  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: secret123
      POSTGRES_DB: myapp
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5
```

### Exemple complet : app 3-tiers

Voici une vraie app avec une file de messages, une API et une base :

```yaml
version: '3.8'

services:
  # Base de données
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: secret123
      POSTGRES_DB: myapp
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

  # Cache Redis
  redis:
    image: redis:alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # API Backend - attend que postgres ET redis soient prêts
  api:
    build: ./api
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 30s

  # Frontend web - attend que l'API soit prête
  web:
    build: ./web
    ports:
      - "80:80"
    depends_on:
      api:
        condition: service_healthy
```

Avec cette config, l'ordre de démarrage est **parfait** :

1. PostgreSQL et Redis démarrent en parallèle
2. Ils passent leurs healthchecks
3. L'API démarre et attend d'être healthy
4. Le frontend démarre en dernier

Zéro crash, zéro race condition ! 🎯

### Autres conditions disponibles

```yaml
depends_on:
  database:
    condition: service_started    # juste démarré (par défaut)
    condition: service_healthy    # healthcheck OK
    condition: service_completed_successfully  # pour les conteneurs qui s'arrêtent après une tâche
```

## 9.3 Profiles dev vs prod

### Le concept des profiles

Les **profiles** te permettent d'activer certains services uniquement dans certains contextes. Genre, tu veux un outil de debug seulement en dev, ou un système de monitoring seulement en prod.

### Exemple basique

```yaml
services:
  # Service toujours actif
  web:
    image: nginx
    ports:
      - "80:80"

  # Service actif uniquement avec --profile dev
  adminer:
    image: adminer
    profiles: ["dev"]
    ports:
      - "8080:8080"

  # Service actif uniquement avec --profile prod
  prometheus:
    image: prom/prometheus
    profiles: ["prod"]
    ports:
      - "9090:9090"
```

### Utilisation

```bash
# Environnement dev : web + adminer
docker compose --profile dev up

# Environnement prod : web + prometheus
docker compose --profile prod up

# Tout activer (déconseillé mais possible)
docker compose --profile dev --profile prod up

# Sans profile : seulement web
docker compose up
```

### Cas d'usage réel : développement vs production

```yaml
version: '3.8'

services:
  # Core app - toujours actif
  api:
    build: ./api
    environment:
      NODE_ENV: ${NODE_ENV:-production}
    ports:
      - "3000:3000"

  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: secret123

  # Outils de développement
  pgadmin:
    image: dpage/pgadmin4
    profiles: ["dev"]
    environment:
      PGADMIN_DEFAULT_EMAIL: dev@example.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"

  mailhog:  # Intercepte les emails en dev
    image: mailhog/mailhog
    profiles: ["dev"]
    ports:
      - "8025:8025"  # Interface web

  # Services de debug avancés
  debug-tools:
    image: nicolaka/netshoot
    profiles: ["debug"]
    command: sleep infinity
    network_mode: "host"

  # Monitoring production
  grafana:
    image: grafana/grafana
    profiles: ["prod", "monitoring"]
    ports:
      - "3001:3000"
    volumes:
      - grafana-data:/var/lib/grafana

  prometheus:
    image: prom/prometheus
    profiles: ["prod", "monitoring"]
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus

volumes:
  grafana-data:
  prometheus-data:
```

### Profiles multiples

Un service peut avoir plusieurs profiles :

```yaml
services:
  monitoring:
    image: monitoring-tool
    profiles: ["dev", "prod"]  # actif dans les deux contextes
```

### Astuce : variable d'environnement

Tu peux définir le profile par défaut :

```bash
# Dans ton .env
COMPOSE_PROFILES=dev

# Maintenant, docker compose up active automatiquement le profile dev
docker compose up
```

## 9.4 Override files

### Le système de fichiers multiples

Docker Compose peut **fusionner** plusieurs fichiers YAML. Ça permet de séparer :

- La config de base (commune)
- Les spécificités de chaque environnement

### Fichier automatique : docker-compose.override.yml

Par défaut, si ce fichier existe, il est **automatiquement chargé** :

```bash
# Ces deux commandes sont identiques :
docker compose up
docker compose -f docker-compose.yml -f docker-compose.override.yml up
```

#### Exemple : config de base

**docker-compose.yml** (commité dans Git)

```yaml
version: '3.8'

services:
  web:
    image: nginx:alpine
    volumes:
      - ./html:/usr/share/nginx/html

  database:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

#### Override local (pas dans Git)

**docker-compose.override.yml** (dans .gitignore)

```yaml
version: '3.8'

services:
  web:
    ports:
      - "8080:80"  # expose le port seulement en local

  database:
    ports:
      - "5432:5432"  # accès direct à la DB en dev
    environment:
      POSTGRES_PASSWORD: dev_password  # override le secret en dev
```

Le résultat fusionné sera :

```yaml
services:
  web:
    image: nginx:alpine
    volumes:
      - ./html:/usr/share/nginx/html
    ports:
      - "8080:80"  # ajouté par override

  database:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: dev_password  # remplacé par override
    ports:
      - "5432:5432"  # ajouté par override
```

### Fichiers multiples explicites

Pour la prod, tu peux utiliser des fichiers spécifiques :

**docker-compose.prod.yml**

```yaml
version: '3.8'

services:
  web:
    image: myregistry.com/web:v1.2.3  # image buildée
    restart: always
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  database:
    volumes:
      - db-data:/var/lib/postgresql/data  # volume persistant
    restart: always
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 2G

volumes:
  db-data:
    driver: local
```

Utilisation :

```bash
# Dev (avec override auto)
docker compose up

# Prod (fichier explicite)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Test (plusieurs fichiers)
docker compose -f docker-compose.yml -f docker-compose.test.yml run tests
```

### Pattern avancé : base + environnement

Structure de projet :

```
project/
├── docker-compose.yml           # base commune
├── docker-compose.override.yml  # dev local (gitignored)
├── docker-compose.dev.yml       # dev partagé
├── docker-compose.prod.yml      # production
├── docker-compose.test.yml      # CI/CD
└── .env.example
```

**docker-compose.yml** (base)

```yaml
services:
  api:
    build:
      context: ./api
      target: ${BUILD_TARGET:-production}
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@database:5432/myapp

  database:
    image: postgres:15-alpine
```

**docker-compose.dev.yml**

```yaml
services:
  api:
    build:
      target: development
    volumes:
      - ./api:/app  # hot reload
    command: npm run dev
    environment:
      NODE_ENV: development
      DEBUG: "app:*"
```

**docker-compose.prod.yml**

```yaml
services:
  api:
    image: myregistry.com/api:${VERSION}
    restart: always
    environment:
      NODE_ENV: production
    deploy:
      replicas: 3
```

### Règles de fusion

- **Listes** (ports, volumes) : **ajoutées** (cumulées)
- **Dictionnaires** (environment) : **mergés** (clés overridées)
- **Valeurs simples** : **remplacées**

```yaml
# Base
environment:
  KEY1: value1
  KEY2: value2

# Override
environment:
  KEY2: new_value2  # remplace
  KEY3: value3      # ajoute

# Résultat
environment:
  KEY1: value1
  KEY2: new_value2  # ✅ remplacé
  KEY3: value3      # ✅ ajouté
```

## 9.5 Resource limits

### Pourquoi limiter les ressources ?

Sans limites, un conteneur peut **bouffer tout le CPU et la RAM** de ta machine. Imagine un bug qui crée une boucle infinie : boom, ton ordi freeze. 💀

### Syntaxe de base

```yaml
services:
  api:
    image: myapi
    deploy:
      resources:
        limits:       # Maximum autorisé
          cpus: '0.5'      # 50% d'un CPU
          memory: 512M     # 512 MB max
        reservations: # Minimum garanti
          cpus: '0.25'     # 25% garanti
          memory: 256M     # 256 MB garantis
```

### Différence limits vs reservations

- **limits** : plafond absolu (le conteneur ne peut pas dépasser)
- **reservations** : ressources réservées (garanties même sous forte charge)

### Exemples par type d'app

#### Application web légère

```yaml
services:
  nginx:
    image: nginx:alpine
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 128M
        reservations:
          cpus: '0.1'
          memory: 64M
```

#### API Node.js moyenne

```yaml
services:
  api:
    build: ./api
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

#### Base de données PostgreSQL

```yaml
services:
  postgres:
    image: postgres:15
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
    environment:
      # Configure aussi Postgres pour matcher les limites
      POSTGRES_SHARED_BUFFERS: 1GB
      POSTGRES_EFFECTIVE_CACHE_SIZE: 3GB
```

#### Worker de traitement intensif

```yaml
services:
  video-encoder:
    build: ./worker
    deploy:
      resources:
        limits:
          cpus: '4'      # peut utiliser 4 CPUs
          memory: 8G
        reservations:
          cpus: '2'
          memory: 4G
```

### Autres options avancées

```yaml
services:
  app:
    image: myapp
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
          pids: 100  # limite le nombre de processus
        reservations:
          cpus: '0.5'
          memory: 512M
          devices:
            - driver: nvidia
              count: 1  # réserve 1 GPU
              capabilities: [gpu]
```

### Monitoring des ressources

Surveille la consommation réelle :

```bash
# Voir l'usage en temps réel
docker stats

# Avec Compose
docker compose stats
```

Tu verras :

```
CONTAINER     CPU %     MEM USAGE / LIMIT     MEM %
myapp_api     45.32%    612MB / 1GB          61.2%
myapp_db      12.45%    1.8GB / 4GB          45.0%
```

### Exemple complet : stack optimisée

```yaml
version: '3.8'

services:
  # Reverse proxy - léger
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 128M

  # API - charge moyenne
  api:
    build: ./api
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  # Database - ressources importantes
  postgres:
    image: postgres:15-alpine
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G

  # Cache - léger mais rapide
  redis:
    image: redis:alpine
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

  # Worker - peut prendre du CPU
  worker:
    build: ./worker
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.5'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Attention en dev vs prod

En dev, les limites strictes peuvent être pénibles. Utilise un override :

**docker-compose.override.yml** (dev)

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '4'      # plus généreux en dev
          memory: 4G
```

## 9.6 Scaling services

### Le concept du scaling

**Scaler** = lancer plusieurs instances du même service en parallèle. Super utile pour gérer plus de charge !

### Scaling basique

```bash
# Lance 3 instances du service "api"
docker compose up -d --scale api=3

# Voir les conteneurs
docker compose ps
```

Résultat :

```
NAME              COMMAND       STATUS    PORTS
myapp-api-1       "npm start"   Up        3000/tcp
myapp-api-2       "npm start"   Up        3000/tcp
myapp-api-3       "npm start"   Up        3000/tcp
```

### Problème : conflit de ports

Si tu as défini un port dans ton docker-compose.yml, ça va planter :

```yaml
# ❌ Impossible de scaler
services:
  api:
    image: myapi
    ports:
      - "3000:3000"  # Conflit : 3 conteneurs veulent le même port !
```

### Solution 1 : pas de ports exposés

Si tu as un reverse proxy (nginx), tes services n'ont pas besoin d'exposer de ports :

```yaml
services:
  # Reverse proxy - un seul
  nginx:
    image: nginx
    ports:
      - "80:80"
    depends_on:
      - api

  # API - scalable ✅
  api:
    image: myapi
    # Pas de ports ! nginx communique via le réseau interne
```

### Solution 2 : port dynamique

Utilise un port aléatoire côté host :

```yaml
services:
  api:
    image: myapi
    ports:
      - "3000"  # pas de "host:container", juste le port container
```

Docker va attribuer automatiquement des ports libres sur l'hôte :

```
myapp-api-1  →  0.0.0.0:32771:3000
myapp-api-2  →  0.0.0.0:32772:3000
myapp-api-3  →  0.0.0.0:32773:3000
```

### Solution 3 : load balancer externe

La vraie solution pro : un load balancer qui distribue les requêtes.

```yaml
version: '3.8'

services:
  # Load balancer Nginx
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - api

  # API - scalable
  api:
    build: ./api
    expose:
      - "3000"
    # Pas de ports publics
```

**nginx.conf** (load balancing)

```nginx
events {
    worker_connections 1024;
}

http {
    # Pool de backends
    upstream api_backend {
        server api:3000;  # Docker Compose résout automatiquement vers TOUTES les instances
    }

    server {
        listen 80;

        location / {
            proxy_pass http://api_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

Maintenant, tu peux scaler :

```bash
docker compose up -d --scale api=5
```

Nginx va distribuer les requêtes entre les 5 instances automatiquement ! 🎯

### Définir le scaling dans le fichier

```yaml
services:
  api:
    image: myapi
    deploy:
      replicas: 3  # démarre toujours 3 instances
```

Avec cette config, un simple `docker compose up` lance 3 instances.

### Exemple complet : app scalable

```yaml
version: '3.8'

services:
  # Reverse proxy
  traefik:
    image: traefik:v2.10
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
      - "8080:8080"  # Dashboard Traefik
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock

  # API - auto-découverte par Traefik
  api:
    build: ./api
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.localhost`)"
      - "traefik.http.services.api.loadbalancer.server.port=3000"
    deploy:
      replicas: 3  # 3 instances dès le départ
    depends_on:
      - redis
      - postgres

  # Worker - scalable aussi
  worker:
    build: ./worker
    deploy:
      replicas: 2
    depends_on:
      - redis

  # Database - ne scale PAS (stateful)
  postgres:
    image: postgres:15
    volumes:
      - db-data:/var/lib/postgresql/data

  # Redis - peut scaler avec Redis Cluster (avancé)
  redis:
    image: redis:alpine

volumes:
  db-data:
```

### Scaling dynamique

Augmente ou diminue à chaud :

```bash
# Passe de 3 à 10 instances
docker compose up -d --scale api=10

# Réduit à 2 instances
docker compose up -d --scale api=2

# Retour au nombre défini dans le fichier
docker compose up -d --scale api=3
```

### Limites du scaling avec Compose

⚠️ **Attention** : Docker Compose n'est pas un orchestrateur avancé. Pour du vrai scaling en production, utilise :

- **Docker Swarm** : scaling natif Docker
- **Kubernetes** : l'orchestrateur pro
- **Services managés** : AWS ECS, Google Cloud Run, Azure Container Apps

Mais pour du dev local ou de petites prod, Compose + un bon load balancer fait largement le job !

## 9.7 Extensions YAML

Les **extensions YAML** te permettent de rendre ton docker-compose.yml **DRY** (Don't Repeat Yourself) en définissant des blocs réutilisables.

### Syntaxe : clés avec x-

Toute clé commençant par `x-` est **ignorée par Docker Compose**, mais tu peux la référencer ailleurs.

```yaml
# Définition d'un bloc réutilisable
x-common-config: &common
  restart: always
  logging:
    driver: json-file
    options:
      max-size: "10m"
      max-file: "3"

services:
  api:
    image: myapi
    <<: *common  # injecte tout le contenu de x-common-config

  worker:
    image: myworker
    <<: *common  # même config ici
```

C'est équivalent à :

```yaml
services:
  api:
    image: myapi
    restart: always
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  worker:
    image: myworker
    restart: always
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

### Anchors (&) et Aliases (*)

C'est du **YAML pur** (pas spécifique à Docker) :

- `&nom` crée une **ancre** (marque-page)
- `*nom` crée un **alias** (copie le contenu de l'ancre)
- `<<: *nom` **merge** le contenu dans le parent

### Exemple : environnements communs

```yaml
x-app-env: &app-env
  DATABASE_URL: postgresql://postgres:secret@database:5432/myapp
  REDIS_URL: redis://cache:6379
  LOG_LEVEL: info

services:
  api:
    image: myapi
    environment:
      <<: *app-env
      SERVICE_NAME: api

  worker:
    image: myworker
    environment:
      <<: *app-env
      SERVICE_NAME: worker
      QUEUE_NAME: jobs
```

Résultat :

```yaml
services:
  api:
    environment:
      DATABASE_URL: postgresql://postgres:secret@database:5432/myapp
      REDIS_URL: redis://cache:6379
      LOG_LEVEL: info
      SERVICE_NAME: api

  worker:
    environment:
      DATABASE_URL: postgresql://postgres:secret@database:5432/myapp
      REDIS_URL: redis://cache:6379
      LOG_LEVEL: info
      SERVICE_NAME: worker
      QUEUE_NAME: jobs
```

### Exemple : healthchecks standardisés

```yaml
x-healthcheck-defaults: &healthcheck-defaults
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s

services:
  api:
    image: myapi
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      <<: *healthcheck-defaults

  web:
    image: nginx
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      <<: *healthcheck-defaults
```

### Exemple : limites de ressources réutilisables

```yaml
x-resources-small: &resources-small
  limits:
    cpus: '0.5'
    memory: 512M
  reservations:
    cpus: '0.25'
    memory: 256M

x-resources-medium: &resources-medium
  limits:
    cpus: '1'
    memory: 1G
  reservations:
    cpus: '0.5'
    memory: 512M

services:
  nginx:
    image: nginx
    deploy:
      resources:
        <<: *resources-small

  api:
    image: myapi
    deploy:
      resources:
        <<: *resources-medium
      replicas: 3
```

### Exemple : logging commun

```yaml
x-logging: &default-logging
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
    compress: "true"

services:
  api:
    image: myapi
    logging: *default-logging

  worker:
    image: myworker
    logging: *default-logging

  database:
    image: postgres
    logging: *default-logging
```

### Merger plusieurs ancres

Tu peux combiner plusieurs blocs :

```yaml
x-common: &common
  restart: always
  networks:
    - app-network

x-logging: &logging
  logging:
    driver: json-file
    options:
      max-size: "10m"

services:
  api:
    image: myapi
    <<: [*common, *logging]  # merge les deux !
```

### Extension complète : template de service

```yaml
x-service-template: &service-template
  restart: always
  networks:
    - app-network
  logging:
    driver: json-file
    options:
      max-size: "10m"
      max-file: "3"
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 1G
  environment: &common-env
    LOG_LEVEL: ${LOG_LEVEL:-info}
    NODE_ENV: ${NODE_ENV:-production}

services:
  api:
    <<: *service-template
    build: ./api
    environment:
      <<: *common-env
      SERVICE_NAME: api
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s

  worker:
    <<: *service-template
    build: ./worker
    environment:
      <<: *common-env
      SERVICE_NAME: worker

networks:
  app-network:
```

### Astuce pro : fichier de fragments

Pour les très gros projets, tu peux même séparer les extensions :

**docker-compose.fragments.yml**

```yaml
x-healthcheck-defaults: &healthcheck-defaults
  interval: 30s
  timeout: 10s
  retries: 3

x-resources-api: &resources-api
  limits:
    cpus: '1'
    memory: 1G
```

**docker-compose.yml**

```yaml
version: '3.8'

# Import des fragments (YAML 1.2)
<<: [*healthcheck-defaults, *resources-api]

services:
  api:
    image: myapi
    healthcheck:
      test: ["CMD", "curl", "-f", "localhost:3000/health"]
      <<: *healthcheck-defaults
    deploy:
      resources:
        <<: *resources-api
```

Puis :

```bash
docker compose -f docker-compose.fragments.yml -f docker-compose.yml up
```

## 9.8 Exercice pratique

On va mettre en pratique TOUT ce qu'on a vu ! Tu vas construire une application 3-tiers complète avec toutes les best practices.

### Objectif

Créer une stack complète :

- **Nginx** (reverse proxy)
- **API Node.js** (backend)
- **PostgreSQL** (database)
- **Redis** (cache)

Avec :

✅ Healthchecks partout
✅ Dépendances `service_healthy`
✅ Profiles dev/prod
✅ Extensions YAML pour DRY
✅ Limites de ressources
✅ Scaling de l'API

### Preparation

Cree la structure du projet :

```bash
mkdir -p mon-app/nginx mon-app/api && cd mon-app
```

```
mon-app/
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .env.example
├── nginx/
│   └── nginx.conf
└── api/
    ├── Dockerfile
    ├── package.json
    └── server.js
```

Cree chaque fichier dans l'ordre ci-dessous.

### 1. L'API Node.js

**api/server.js**

```javascript
const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Redis connection
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect();

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database
    await pool.query('SELECT 1');

    // Check redis
    await redisClient.ping();

    res.json({ status: 'healthy', timestamp: new Date() });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

// Example endpoint
app.get('/api/visits', async (req, res) => {
  try {
    // Increment visits in Redis
    const visits = await redisClient.incr('visits');

    // Log to database
    await pool.query(
      'INSERT INTO visits (count, timestamp) VALUES ($1, $2)',
      [visits, new Date()]
    );

    res.json({ visits });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
```

**api/Dockerfile**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Install curl for healthcheck
RUN apk add --no-cache curl

EXPOSE 3000

CMD ["node", "server.js"]
```

**api/package.json**

```json
{
  "name": "api",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "redis": "^4.6.7"
  }
}
```

### 2. Configuration Nginx

**nginx/nginx.conf**

```nginx
events {
    worker_connections 1024;
}

http {
    # Load balancing pour l'API
    upstream api_backend {
        server api:3000;
    }

    server {
        listen 80;
        server_name localhost;

        # Health check
        location /health {
            access_log off;
            return 200 "OK\n";
            add_header Content-Type text/plain;
        }

        # Proxy vers l'API
        location /api/ {
            proxy_pass http://api_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

            # Timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Page d'accueil statique
        location / {
            return 200 "Welcome to Docker Learn App!\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### 3. Docker Compose - Base

**docker-compose.yml**

```yaml
version: '3.8'

# ============================================
# EXTENSIONS YAML (DRY)
# ============================================

x-healthcheck-defaults: &healthcheck-defaults
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 30s

x-common-env: &common-env
  NODE_ENV: ${NODE_ENV:-production}
  DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD:-secret123}@database:5432/${POSTGRES_DB:-myapp}
  REDIS_URL: redis://cache:6379

x-logging: &default-logging
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"

x-restart-policy: &restart-policy
  restart: unless-stopped

# ============================================
# SERVICES
# ============================================

services:
  # Reverse Proxy
  nginx:
    image: nginx:alpine
    <<: *restart-policy
    ports:
      - "${NGINX_PORT:-80}:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      api:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      <<: *healthcheck-defaults
    logging: *default-logging
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 128M
    networks:
      - frontend
      - backend

  # API Backend
  api:
    build: ./api
    <<: *restart-policy
    environment:
      <<: *common-env
      PORT: 3000
    depends_on:
      database:
        condition: service_healthy
      cache:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      <<: *healthcheck-defaults
    logging: *default-logging
    deploy:
      replicas: ${API_REPLICAS:-2}
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    networks:
      - backend

  # PostgreSQL Database
  database:
    image: postgres:15-alpine
    <<: *restart-policy
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-secret123}
      POSTGRES_DB: ${POSTGRES_DB:-myapp}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 5s
      timeout: 3s
      retries: 5
    logging: *default-logging
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    networks:
      - backend

  # Redis Cache
  cache:
    image: redis:alpine
    <<: *restart-policy
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    logging: *default-logging
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
    networks:
      - backend

# ============================================
# NETWORKS
# ============================================

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # pas d'accès internet direct

# ============================================
# VOLUMES
# ============================================

volumes:
  postgres-data:
  redis-data:
```

### 4. Override Dev

**docker-compose.dev.yml**

```yaml
version: '3.8'

services:
  # Outils de debug seulement en dev
  pgadmin:
    image: dpage/pgadmin4
    profiles: ["dev"]
    environment:
      PGADMIN_DEFAULT_EMAIL: dev@example.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    networks:
      - backend

  redis-commander:
    image: rediscommander/redis-commander
    profiles: ["dev"]
    environment:
      REDIS_HOSTS: cache:cache:6379
    ports:
      - "8081:8081"
    networks:
      - backend

  # Override de l'API pour le dev
  api:
    build:
      context: ./api
      dockerfile: Dockerfile.dev
    volumes:
      - ./api:/app
      - /app/node_modules
    command: npm run dev  # hot reload
    environment:
      NODE_ENV: development
      DEBUG: "app:*"
    ports:
      - "3000:3000"  # expose directement en dev

  # Expose la DB en dev
  database:
    ports:
      - "5432:5432"

  # Expose Redis en dev
  cache:
    ports:
      - "6379:6379"
```

### 5. Override Prod

**docker-compose.prod.yml**

```yaml
version: '3.8'

services:
  # Monitoring seulement en prod
  prometheus:
    image: prom/prometheus
    profiles: ["prod", "monitoring"]
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - backend

  grafana:
    image: grafana/grafana
    profiles: ["prod", "monitoring"]
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "3001:3000"
    networks:
      - backend

  # Config prod API
  api:
    image: myregistry.com/api:${VERSION:-latest}
    deploy:
      replicas: 5  # plus d'instances en prod
      resources:
        limits:
          cpus: '2'
          memory: 2G

  # Config prod Database
  database:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
    # Backup automatique
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backups:/backups

volumes:
  prometheus-data:
  grafana-data:
```

### 6. Fichier d'init SQL

**init.sql**

```sql
-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
    id SERIAL PRIMARY KEY,
    count INTEGER NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_visits_timestamp ON visits(timestamp);

-- Insert initial data
INSERT INTO visits (count, timestamp) VALUES (0, NOW());
```

### 7. Variables d'environnement

**.env.example**

```bash
# Environment
NODE_ENV=production

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changeme_in_production
POSTGRES_DB=myapp

# Nginx
NGINX_PORT=80

# Scaling
API_REPLICAS=2
```

### 8. Utilisation

#### Développement

```bash
# Copier les variables
cp .env.example .env

# Lancer la stack dev avec outils
docker compose -f docker-compose.yml -f docker-compose.dev.yml --profile dev up -d

# Accès :
# - App : http://localhost
# - API : http://localhost:3000
# - PgAdmin : http://localhost:5050
# - Redis Commander : http://localhost:8081
```

#### Production

```bash
# Lancer la stack prod avec monitoring
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up -d

# Scaler l'API dynamiquement
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale api=10

# Accès :
# - App : http://localhost
# - Prometheus : http://localhost:9090
# - Grafana : http://localhost:3001
```

#### Tests

```bash
# Tester le healthcheck de l'API
curl http://localhost/api/health

# Tester le compteur de visites
curl http://localhost/api/visits

# Voir les logs
docker compose logs -f api

# Voir les ressources
docker compose stats
```

### 9. Vérifications

Checklist pour vérifier que tout fonctionne :

```bash
# 1. Tous les services sont healthy
docker compose ps
# Tous doivent être "Up (healthy)"

# 2. L'ordre de démarrage est respecté
docker compose logs | grep "started"
# database et cache d'abord, puis api, puis nginx

# 3. Le scaling fonctionne
docker compose up -d --scale api=3
docker compose ps
# Tu dois voir api-1, api-2, api-3

# 4. Nginx distribue les requêtes
for i in {1..10}; do curl -s http://localhost/api/visits; done
# Les visites augmentent, les requêtes sont distribuées

# 5. Les healthchecks fonctionnent
docker compose exec api curl -f http://localhost:3000/health
# {"status":"healthy",...}

# 6. Les limites de ressources sont actives
docker stats --no-stream
# Vérifie que les limites sont appliquées
```

### 10. Points clés de l'exercice

Tu as maintenant une stack qui utilise :

✅ **Healthchecks** sur tous les services
✅ **depends_on** avec `service_healthy` pour un ordre de démarrage parfait
✅ **Profiles** pour séparer dev/prod
✅ **Override files** pour personnaliser chaque environnement
✅ **Extensions YAML** (`x-`) pour éviter les répétitions
✅ **Resource limits** pour contrôler CPU/RAM
✅ **Scaling** de l'API avec load balancing automatique
✅ **Réseaux** séparés (frontend/backend)
✅ **Volumes** pour persister les données

C'est une vraie architecture production-ready ! 🚀

---

## Récap final

Tu as appris à :

- **Healthchecks** : vérifier que tes services sont vraiment fonctionnels
- **depends_on avancé** : attendre que les dépendances soient healthy
- **Profiles** : activer des services selon l'environnement
- **Override files** : personnaliser sans modifier la base
- **Resource limits** : empêcher un service de tout bouffer
- **Scaling** : lancer plusieurs instances pour gérer la charge
- **Extensions YAML** : rendre tes fichiers DRY et maintenables

Avec ces techniques, tu peux créer des applications Docker Compose **robustes, scalables et professionnelles** ! 💪

La prochaine étape ? Découvrir les orchestrateurs comme **Kubernetes** pour gérer des centaines de conteneurs en production. Mais tu as maintenant des bases **solides** ! 🎯
