---
title: "Docker Compose avec dependances"
description: "Deployer une application multi-services avec persistance des donnees"
order: 5
duration: "40 min"
icon: "⚙️"
xpReward: 300
objectives:
  - "Creer un docker-compose.yml multi-services"
  - "Comprendre les volumes et la persistance"
  - "Deployer Nginx + PHP + MySQL"
---

## 5.1 Le projet : Un site web avec un compteur de visites

On va creer une application **realiste** avec plusieurs services qui communiquent :

- **Nginx** : sert notre page web
- **PHP** : traite la logique (compteur de visites)
- **MySQL** : stocke les donnees de maniere persistante

Le compteur de visites est **persistant** : meme si tu fais `docker compose down` et
`docker compose up`, le compteur ne repart PAS a zero grace aux **volumes**.

```
┌──────────────────────────────────────────────────────┐
│                  Docker Compose                      │
│                                                      │
│   ┌─────────┐    ┌─────────┐    ┌─────────────┐     │
│   │  Nginx  │───>│   PHP   │───>│    MySQL     │     │
│   │ (port   │    │(FastCGI)│    │  (donnees)   │     │
│   │  8080)  │    │         │    │              │     │
│   └─────────┘    └─────────┘    └──────┬───────┘     │
│                                        │             │
│                                 ┌──────┴───────┐     │
│                                 │   Volume     │     │
│                                 │ (persistant) │     │
│                                 └──────────────┘     │
└──────────────────────────────────────────────────────┘

Navigateur --> localhost:8080 --> Nginx --> PHP --> MySQL
                                                    │
                                              Donnees sauvees
                                              sur ton disque !
```

---

## 5.2 Comprendre les concepts

### Les volumes Docker

Sans volume, les donnees sont **dans le conteneur**. Si tu supprimes le conteneur,
les donnees sont perdues.

```
SANS VOLUME :                          AVEC VOLUME :

  Conteneur MySQL                        Conteneur MySQL
  ┌──────────────┐                       ┌──────────────┐
  │  Donnees     │ -- docker rm -->  PERDU│  Donnees     │
  └──────────────┘                       └──────┬───────┘
                                                │
                                         ┌──────┴───────┐
                                         │  Volume sur  │
                                         │  ton disque  │ --> SAUVEGARDE !
                                         └──────────────┘
                                         (survit au docker rm)
```

### Les reseaux Docker

Docker Compose cree automatiquement un **reseau** pour que les conteneurs
puissent communiquer entre eux **par leur nom de service**.

```yaml
services:
  web:        # accessible via "web" par les autres conteneurs
  php:        # accessible via "php" par les autres conteneurs
  database:   # accessible via "database" par les autres conteneurs
```

### depends_on : l'ordre de demarrage

```yaml
services:
  web:
    depends_on:
      - php            # Nginx attend que PHP soit pret
  php:
    depends_on:
      - database       # PHP attend que MySQL soit pret

# Ordre de demarrage : database --> php --> web
```

---

## 5.3 Etape 1 : Structure du projet

Cree cette structure :

```
mon-projet-compose/
  ├── docker-compose.yml
  ├── nginx/
  │   └── default.conf
  ├── php/
  │   └── Dockerfile
  └── site/
      ├── index.php
      └── style.css
```

```bash
# Creer les dossiers
mkdir -p mon-projet-compose/{nginx,php,site}
cd mon-projet-compose
```

---

## 5.4 Etape 2 : Creer les fichiers

### site/index.php

```php
<?php
// Database connection parameters
$host = 'database';        // Name of the MySQL service in docker-compose
$dbname = 'myapp';
$username = 'appuser';
$password = 'apppassword';

$visitCount = 0;
$errorMessage = '';

try {
    // Connect to MySQL
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // Create the visits table if it does not exist
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS visits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");

    // Record this visit
    $pdo->exec("INSERT INTO visits (visited_at) VALUES (NOW())");

    // Count all visits
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM visits");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $visitCount = $row['total'];

} catch (PDOException $e) {
    $errorMessage = "Database connection error: " . $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Docker Compose Project</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="card">
        <div class="avatar">DC</div>
        <h1>Docker Compose <span class="highlight">Multi-Services</span></h1>
        <p class="subtitle">Nginx + PHP + MySQL</p>

        <div class="counter-box">
            <span class="counter-label">Nombre de visites</span>
            <span class="counter-value"><?php echo $visitCount; ?></span>
            <span class="counter-hint">Persistant ! Essaie docker compose down puis up</span>
        </div>

        <?php if ($errorMessage): ?>
            <div class="error"><?php echo htmlspecialchars($errorMessage); ?></div>
        <?php endif; ?>

        <div class="info-grid">
            <div class="info-item">
                <span class="label">Serveur Web</span>
                <span class="value">Nginx Alpine</span>
            </div>
            <div class="info-item">
                <span class="label">Backend</span>
                <span class="value">PHP 8 FPM</span>
            </div>
            <div class="info-item">
                <span class="label">Base de donnees</span>
                <span class="value">MySQL 8</span>
            </div>
            <div class="info-item">
                <span class="label">Persistance</span>
                <span class="value">Volume Docker</span>
            </div>
        </div>

        <div class="tech-stack">
            <span class="badge">Docker Compose</span>
            <span class="badge">Nginx</span>
            <span class="badge">PHP</span>
            <span class="badge">MySQL</span>
            <span class="badge">Volumes</span>
        </div>

        <p class="footer-text">
            Rafraichis cette page pour incrementer le compteur !
        </p>
    </div>
</body>
</html>
```

### site/style.css

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #052FAD 0%, #6B73FF 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.card {
    background: white;
    border-radius: 20px;
    padding: 40px;
    max-width: 550px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #052FAD, #6B73FF);
    color: white;
    font-size: 28px;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto 20px;
}

h1 {
    font-size: 1.4rem;
    color: #333;
    margin-bottom: 5px;
}

.highlight {
    color: #052FAD;
}

.subtitle {
    color: #777;
    font-size: 0.95rem;
    margin-bottom: 25px;
}

.counter-box {
    background: linear-gradient(135deg, #052FAD, #6B73FF);
    border-radius: 15px;
    padding: 25px;
    margin-bottom: 25px;
    color: white;
}

.counter-label {
    display: block;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 8px;
    opacity: 0.9;
}

.counter-value {
    display: block;
    font-size: 3rem;
    font-weight: bold;
    margin-bottom: 8px;
}

.counter-hint {
    display: block;
    font-size: 0.75rem;
    opacity: 0.7;
    font-style: italic;
}

.error {
    background: #ffe0e0;
    color: #c00;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 0.85rem;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 25px;
}

.info-item {
    background: #f8f9fa;
    border-radius: 10px;
    padding: 15px;
}

.label {
    display: block;
    font-size: 0.7rem;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4px;
}

.value {
    display: block;
    font-size: 0.95rem;
    color: #333;
    font-weight: 600;
}

.tech-stack {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 20px;
}

.badge {
    background: #052FAD;
    color: white;
    padding: 5px 14px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
}

.footer-text {
    color: #aaa;
    font-size: 0.8rem;
    font-style: italic;
}
```

### nginx/default.conf

```nginx
server {
    listen 80;
    server_name localhost;

    root /var/www/html;
    index index.php index.html;

    # Serve static files directly
    location / {
        try_files $uri $uri/ =404;
    }

    # Send PHP files to the PHP-FPM service
    location ~ \.php$ {
        fastcgi_pass php:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

**Explication** : Nginx recoit la requete HTTP. Si c'est un fichier `.php`, il le transmet
a PHP-FPM (le service `php` sur le port 9000). Sinon, il sert le fichier directement (CSS, images...).

### php/Dockerfile

```dockerfile
# Image PHP avec FPM (FastCGI Process Manager)
FROM php:8.3-fpm-alpine

# Install the PDO MySQL extension (needed to connect to MySQL)
RUN docker-php-ext-install pdo pdo_mysql

# The working directory
WORKDIR /var/www/html
```

**Explication** : On part de l'image PHP officielle et on ajoute l'extension `pdo_mysql`
pour pouvoir se connecter a MySQL.

---

## 5.5 Etape 3 : Le docker-compose.yml (le coeur du projet)

### docker-compose.yml

```yaml
services:
  # ========================================
  # SERVICE 1 : Nginx (serveur web)
  # ========================================
  web:
    image: nginx:alpine
    ports:
      - "8080:80"                         # localhost:8080 -> conteneur:80
    volumes:
      - ./site:/var/www/html:ro           # Monter le code du site (lecture seule)
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro  # Config Nginx
    depends_on:
      - php                               # Attendre que PHP soit pret
    restart: unless-stopped

  # ========================================
  # SERVICE 2 : PHP-FPM (traitement PHP)
  # ========================================
  php:
    build: ./php                          # Construire depuis php/Dockerfile
    volumes:
      - ./site:/var/www/html              # Meme code que Nginx
    depends_on:
      - database                          # Attendre que MySQL soit pret
    restart: unless-stopped

  # ========================================
  # SERVICE 3 : MySQL (base de donnees)
  # ========================================
  database:
    image: mysql:8.0
    environment:                          # Variables d'environnement
      MYSQL_ROOT_PASSWORD: rootpassword   # Mot de passe root
      MYSQL_DATABASE: myapp               # Creer cette base au demarrage
      MYSQL_USER: appuser                 # Creer cet utilisateur
      MYSQL_PASSWORD: apppassword         # Avec ce mot de passe
    volumes:
      - mysql_data:/var/lib/mysql         # VOLUME PERSISTANT !
    ports:
      - "3306:3306"                       # Optionnel : acces direct a MySQL
    restart: unless-stopped

# ==========================================
# VOLUMES : Stockage persistant
# ==========================================
volumes:
  mysql_data:                             # Volume nomme, gere par Docker
    # Les donnees MySQL survivent a docker compose down !
    # Seul docker compose down -v les supprime.
```

### Explication ligne par ligne

**`volumes` au niveau du service** (minuscule, sous chaque service) :
```yaml
volumes:
  - ./site:/var/www/html:ro    # Bind mount : dossier de ton PC -> conteneur
  - mysql_data:/var/lib/mysql  # Named volume : gere par Docker
```

**`volumes` au niveau racine** (en bas du fichier) :
```yaml
volumes:
  mysql_data:   # Declaration du volume nomme
```

**Difference entre les deux types** :

| Type | Syntaxe | Usage | Persistence |
|------|---------|-------|-------------|
| **Bind mount** | `./local:/conteneur` | Code source, config | Lie a un dossier precis |
| **Named volume** | `nom:/conteneur` | Base de donnees | Gere par Docker, survit a `down` |

---

## 5.6 Etape 4 : Lancer le projet

```bash
# Se placer dans le dossier du projet
cd mon-projet-compose

# Construire les images et lancer tous les services
docker compose up -d --build
```

Tu devrais voir :
```
[+] Building 8.2s (6/6) FINISHED         (php)
[+] Running 4/4
 ✔ Network mon-projet-compose_default  Created
 ✔ Container mon-projet-compose-database-1  Started
 ✔ Container mon-projet-compose-php-1       Started
 ✔ Container mon-projet-compose-web-1       Started
```

### Verifier que tout fonctionne

```bash
# Voir l'etat des services
docker compose ps

# Tu devrais voir :
# NAME                            STATUS
# mon-projet-compose-database-1   Up
# mon-projet-compose-php-1        Up
# mon-projet-compose-web-1        Up

# Voir les logs (utile pour deboguer)
docker compose logs -f

# Voir les logs d'un service specifique
docker compose logs -f database
docker compose logs -f php
```

### Tester dans le navigateur

Va sur **http://localhost:8080**

Tu devrais voir ta page avec le compteur de visites. **Rafraichis la page** : le compteur
augmente a chaque visite !

---

## 5.7 Etape 5 : Prouver la persistance

C'est le moment le plus important. On va prouver que les donnees survivent
a un arret complet.

```bash
# 1. Rafraichis la page quelques fois pour avoir un compteur > 0
#    (note le nombre, par exemple : 7)

# 2. Arreter TOUS les conteneurs et supprimer les conteneurs + reseaux
docker compose down

# 3. Verifier que tout est arrete
docker compose ps
# (rien ne devrait apparaitre)

# 4. Relancer tout
docker compose up -d

# 5. Ouvrir http://localhost:8080
#    --> Le compteur reprend a 7 (ou le nombre que tu avais) !
#    --> Les donnees ont survecu grace au volume !
```

### Et si on veut TOUT supprimer (y compris les donnees) ?

```bash
# Le flag -v supprime aussi les volumes nommes
docker compose down -v

# Maintenant, si tu relances :
docker compose up -d
# --> Le compteur repart a 0 car les donnees ont ete supprimees
```

```
docker compose down       --> Conteneurs supprimes, DONNEES CONSERVEES
docker compose down -v    --> Conteneurs supprimes, DONNEES SUPPRIMEES
```

---

## 5.8 Etape 6 : Modifier le site (developpement live)

Grace aux **bind mounts** (`./site:/var/www/html`), tu peux modifier tes fichiers
PHP et CSS et voir les changements **immediatement** sans rebuild !

```bash
# Modifie site/index.php (par exemple change le titre)
# Modifie site/style.css (par exemple change la couleur)

# Rafraichis le navigateur --> les changements apparaissent !
# PAS BESOIN de docker compose down/up !
```

C'est la difference clé :
- **Bind mount** (code source) : changements en temps reel
- **Image buildee** (Module 4) : il faut rebuild

---

## 5.9 Commandes utiles pour ce projet

```bash
# Voir les volumes Docker
docker volume ls

# Inspecter un volume
docker volume inspect mon-projet-compose_mysql_data

# Se connecter directement a MySQL pour verifier les donnees
docker compose exec database mysql -u appuser -papppassword myapp

# Dans le shell MySQL :
# SELECT * FROM visits;
# SELECT COUNT(*) FROM visits;
# exit

# Voir les reseaux crees par Docker Compose
docker network ls

# Redemarrer un seul service (sans toucher aux autres)
docker compose restart php

# Reconstruire un seul service
docker compose up -d --build php

# Voir l'utilisation des ressources en temps reel
docker compose stats
```

---

## 5.10 Schema recapitulatif

```
                        docker-compose.yml
                              │
              ┌───────────────┼───────────────┐
              │               │               │
         ┌────┴────┐    ┌────┴────┐    ┌─────┴─────┐
         │   web   │    │   php   │    │ database  │
         │ (nginx) │    │(php-fpm)│    │  (mysql)  │
         └────┬────┘    └────┬────┘    └─────┬─────┘
              │              │               │
    Port 8080:80      Build depuis     Variables env
    Bind mounts:      php/Dockerfile   MYSQL_DATABASE
    - ./site (code)   Bind mount:      MYSQL_USER
    - nginx/conf      - ./site (code)  MYSQL_PASSWORD
              │              │               │
              │         depends_on      Volume nomme:
         depends_on     database        mysql_data
            php              │               │
              │              │               │
              └──── Reseau interne ──────────┘
                   (communication par
                    nom de service)


Flux d'une requete :
  Navigateur
      │
      ▼
  localhost:8080
      │
      ▼
  Nginx (web)
      │ "c'est du .php ? je transmet a php:9000"
      ▼
  PHP-FPM (php)
      │ "je me connecte a database:3306"
      ▼
  MySQL (database)
      │ "je lis/ecris dans le volume"
      ▼
  Volume mysql_data (sur ton disque dur)
```

---

## 5.11 QCM Module 5 (10 questions supplementaires)

### Q21. A quoi sert le mot-cle `depends_on` dans docker-compose.yml ?
- A) A partager des fichiers entre conteneurs
- B) A definir l'ordre de demarrage des services
- C) A limiter les ressources d'un conteneur
- D) A connecter les conteneurs a Internet

### Q22. Quelle est la difference entre un "bind mount" et un "named volume" ?
- A) Il n'y a pas de difference
- B) Un bind mount lie un dossier de ton PC, un named volume est gere par Docker
- C) Un named volume est plus rapide
- D) Un bind mount est persistant, un named volume ne l'est pas

### Q23. Que se passe-t-il quand tu fais `docker compose down` (sans -v) ?
- A) Tout est supprime, y compris les volumes
- B) Les conteneurs et reseaux sont supprimes, mais les volumes nommes sont conserves
- C) Rien n'est supprime
- D) Seules les images sont supprimees

### Q24. Que fait `docker compose down -v` ?
- A) Active le mode verbose
- B) Supprime les conteneurs, reseaux ET les volumes nommes
- C) Verifie la configuration
- D) Affiche la version

### Q25. Comment les conteneurs communiquent entre eux dans Docker Compose ?
- A) Par adresse IP uniquement
- B) Par le nom du service defini dans docker-compose.yml
- C) Via un fichier partage
- D) Ils ne peuvent pas communiquer

### Q26. Dans `- ./site:/var/www/html:ro`, que signifie `:ro` ?
- A) "run only" - le conteneur demarre en lecture seule
- B) "read-only" - le conteneur ne peut que lire ces fichiers, pas les modifier
- C) "root-owned" - les fichiers appartiennent a root
- D) "rollback" - revenir en arriere si erreur

### Q27. Pourquoi utilise-t-on un volume nomme pour MySQL plutot qu'un bind mount ?
- A) C'est obligatoire
- B) Docker gere mieux les performances et la persistance des BDD avec les named volumes
- C) Les bind mounts ne fonctionnent pas avec MySQL
- D) C'est moins cher en espace disque

### Q28. Que fait `docker compose exec database mysql -u appuser -p myapp` ?
- A) Cree une nouvelle base de donnees
- B) Ouvre un shell MySQL interactif dans le conteneur database
- C) Supprime la base de donnees
- D) Exporte les donnees

### Q29. Si tu modifies un fichier PHP avec un bind mount, que faut-il faire ?
- A) Faire docker compose down puis up
- B) Reconstruire l'image avec --build
- C) Simplement rafraichir la page, le changement est immediat
- D) Redemarrer le service PHP

### Q30. Quel est le role de `restart: unless-stopped` ?
- A) Empecher le conteneur de redemarrer
- B) Redemarrer automatiquement le conteneur s'il plante (sauf si arrete manuellement)
- C) Redemarrer Docker Desktop
- D) Mettre le conteneur en pause

---

## 5.12 Reponses QCM Module 5

| Question | Reponse | Explication |
|----------|---------|-------------|
| Q21 | **B** | `depends_on` definit l'ordre : le service demarre apres ses dependances |
| Q22 | **B** | Bind mount = lien vers un dossier precis, named volume = Docker gere le stockage |
| Q23 | **B** | `down` supprime conteneurs et reseaux, les named volumes sont conserves |
| Q24 | **B** | Le flag `-v` supprime aussi les volumes nommes (donnees perdues !) |
| Q25 | **B** | Docker Compose cree un reseau et chaque service est accessible par son nom |
| Q26 | **B** | `ro` = read-only, le conteneur peut lire mais pas ecrire dans ce dossier |
| Q27 | **B** | Les named volumes sont optimises par Docker pour les BDD (cache, permissions) |
| Q28 | **B** | `exec` execute une commande dans un conteneur en cours, ici le client MySQL |
| Q29 | **C** | Avec un bind mount, les fichiers sont partages en temps reel |
| Q30 | **B** | Le conteneur redemarre auto sauf si tu l'arretes avec `docker stop` |

---

