---
title: "Docker Networking"
description: "Comprendre et configurer les reseaux Docker"
order: 7
duration: "25 min"
icon: "🌐"
xpReward: 200
objectives:
  - "Comprendre les types de reseaux Docker"
  - "Creer et gerer des reseaux custom"
  - "Isoler les services avec les reseaux"
---

# Docker Networking

Maintenant que tu sais créer et gérer des conteneurs, il est temps de comprendre comment ils communiquent entre eux ! Docker networking, c'est un peu comme le Wi-Fi de tes conteneurs : ça leur permet de discuter ensemble sans s'emmêler les pinceaux.

---

## 7.1 Types de reseaux Docker

Docker propose plusieurs types de réseaux, chacun avec ses superpowers. Voyons les principaux :

### Bridge (par défaut)

C'est le réseau par défaut quand tu lances un conteneur. Il crée un pont virtuel entre tes conteneurs et ta machine.

```
┌─────────────────────────────────────────┐
│         Ton ordinateur (host)           │
│                                         │
│  ┌──────────┐      ┌──────────┐        │
│  │Container1│──┐ ┐──│Container2│        │
│  └──────────┘  │ │  └──────────┘        │
│                ├─┤  docker0 (bridge)    │
│  ┌──────────┐  │ │  ┌──────────┐        │
│  │Container3│──┘ └──│Container4│        │
│  └──────────┘       └──────────┘        │
│                 │                       │
│            [Interface réseau]           │
└─────────────┴───────────────────────────┘
              │
          Internet
```

**Quand l'utiliser ?** Pour la plupart de tes applications ! C'est le choix safe.

### Host

Le conteneur partage directement le réseau de ta machine. Pas d'isolation réseau.

```
┌─────────────────────────────────────────┐
│         Ton ordinateur (host)           │
│                                         │
│  ┌────────────────────────────┐         │
│  │      Container (host)      │         │
│  │  Même IP que la machine!   │         │
│  └────────────────────────────┘         │
│                                         │
│            [Interface réseau]           │
└─────────────┴───────────────────────────┘
              │
          Internet
```

**Quand l'utiliser ?** Rarement ! Uniquement si tu as besoin de performances réseau maximales ou si ton app doit écouter sur plein de ports.

```bash
# Run a container in host network mode
docker run --network host nginx
```

### None

Aucun réseau du tout. Le conteneur est totalement isolé.

```
┌─────────────────────────────────────────┐
│         Ton ordinateur (host)           │
│                                         │
│  ┌────────────────────────────┐         │
│  │   Container (none)         │         │
│  │   ❌ Pas de réseau         │         │
│  │   Total blackout!          │         │
│  └────────────────────────────┘         │
│                                         │
└─────────────────────────────────────────┘
```

**Quand l'utiliser ?** Pour des conteneurs qui n'ont besoin d'aucune communication réseau (calculs isolés, tests de sécurité).

```bash
# Run a container with no network
docker run --network none alpine
```

### Custom Bridge

Un réseau bridge que TU crées toi-même. C'est la star du show pour les apps multi-conteneurs !

```
┌─────────────────────────────────────────┐
│         Ton ordinateur (host)           │
│                                         │
│  ┌──────────────────────────┐           │
│  │   Custom Network "app"   │           │
│  │  ┌──────┐    ┌────────┐ │           │
│  │  │ web  │────│database│ │           │
│  │  └──────┘    └────────┘ │           │
│  └──────────────────────────┘           │
│                                         │
└─────────────────────────────────────────┘
```

**Quand l'utiliser ?** Dès que tu as plusieurs conteneurs qui doivent se parler ! C'est le meilleur choix.

---

## 7.2 Default bridge vs custom bridge

C'est ici que ça devient intéressant. Il y a une GROSSE différence entre le bridge par défaut et un bridge custom.

### Le bridge par défaut : communication par IP uniquement

Avec le réseau par défaut, tes conteneurs peuvent se parler... mais uniquement si tu connais leur IP. Galère !

```bash
# Create two containers on default bridge
docker run -d --name container1 alpine sleep 3600
docker run -d --name container2 alpine sleep 3600

# Get the IP of container1
docker inspect container1 | grep IPAddress
# Output: "IPAddress": "172.17.0.2"

# Try to ping by name from container2 (FAIL)
docker exec container2 ping container1
# ping: bad address 'container1'

# Ping by IP (SUCCESS, but ugly)
docker exec container2 ping 172.17.0.2
# PING 172.17.0.2 (172.17.0.2): 56 data bytes
# 64 bytes from 172.17.0.2: seq=0 ttl=64 time=0.123 ms
```

**Problème** : Si Docker redémarre le conteneur, l'IP peut changer. Ton app casse. Pas cool.

### Le custom bridge : DNS automatique par nom de conteneur

Avec un réseau custom, Docker fait de la magie : les conteneurs peuvent se trouver par leur nom !

```bash
# Create a custom network
docker network create mon-reseau

# Create two containers on this custom network
docker run -d --name web --network mon-reseau alpine sleep 3600
docker run -d --name api --network mon-reseau alpine sleep 3600

# Ping by name (SUCCESS!)
docker exec web ping api
# PING api (172.18.0.3): 56 data bytes
# 64 bytes from 172.18.0.3: seq=0 ttl=64 time=0.089 ms
```

**Magie** : Docker a un serveur DNS intégré qui convertit "api" en l'IP du conteneur. C'est automatique !

### Comparaison côte à côte

| Feature                    | Default Bridge | Custom Bridge |
|----------------------------|----------------|---------------|
| DNS par nom de conteneur   | ❌ Non         | ✅ Oui        |
| Isolation                  | ⚠️ Partielle   | ✅ Totale     |
| Configuration              | ✅ Auto        | ⚙️ Manuelle   |
| Recommandé pour la prod    | ❌ Non         | ✅ Oui        |

**Règle d'or** : Utilise TOUJOURS des custom bridges pour tes apps multi-conteneurs !

---

## 7.3 Creer et gerer des reseaux

Docker te donne des commandes super simples pour gérer tes réseaux. Voyons les essentielles :

### Créer un réseau

```bash
# Create a basic custom bridge network
docker network create mon-app

# Create a network with custom subnet
docker network create --subnet=192.168.100.0/24 mon-reseau-perso

# Create a network with a specific driver
docker network create --driver bridge frontend-network
```

**Output** :
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

C'est l'ID du réseau. Mais tu peux utiliser son nom, c'est plus simple !

### Lister les réseaux

```bash
# List all networks
docker network ls
```

**Output** :
```
NETWORK ID     NAME              DRIVER    SCOPE
a1b2c3d4e5f6   bridge            bridge    local
7h8i9j0k1l2m   host              host      local
3n4o5p6q7r8s   none              null      local
9t0u1v2w3x4y   mon-app           bridge    local
5z6a7b8c9d0e   frontend-network  bridge    local
```

Tu vois ? Tes réseaux custom apparaissent à côté des réseaux par défaut.

### Inspecter un réseau

```bash
# Get detailed info about a network
docker network inspect mon-app
```

**Output** :
```json
[
    {
        "Name": "mon-app",
        "Id": "9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4",
        "Created": "2026-02-06T10:30:45.123456789Z",
        "Scope": "local",
        "Driver": "bridge",
        "IPAM": {
            "Config": [
                {
                    "Subnet": "172.18.0.0/16",
                    "Gateway": "172.18.0.1"
                }
            ]
        },
        "Containers": {
            "abc123": {
                "Name": "web",
                "IPv4Address": "172.18.0.2/16"
            },
            "def456": {
                "Name": "api",
                "IPv4Address": "172.18.0.3/16"
            }
        }
    }
]
```

**Super utile** pour voir quels conteneurs sont connectés et leurs IPs !

### Supprimer un réseau

```bash
# Remove a network
docker network rm mon-app

# Remove all unused networks
docker network prune
```

**Attention** : Tu ne peux pas supprimer un réseau si des conteneurs l'utilisent encore !

```bash
# This will fail if containers are connected
docker network rm mon-app
# Error: network mon-app has active endpoints

# Stop and remove containers first
docker rm -f web api
docker network rm mon-app
# mon-app
```

---

## 7.4 Connecter des conteneurs

Il y a plusieurs façons de connecter des conteneurs à un réseau. Voyons les méthodes principales :

### Au moment du `docker run` avec `--network`

C'est la méthode la plus simple : tu spécifies le réseau dès le lancement.

```bash
# Create a network
docker network create app-network

# Run containers on this network
docker run -d --name database \
  --network app-network \
  postgres:15

docker run -d --name api \
  --network app-network \
  -e DATABASE_URL=postgresql://postgres@database:5432/mydb \
  node:20

docker run -d --name frontend \
  --network app-network \
  -e API_URL=http://api:3000 \
  nginx:alpine
```

Regarde : dans les variables d'environnement, on utilise `database` et `api` comme hostnames. Ça marche grâce au DNS de Docker !

### Tester la communication par ping

```bash
# Install ping in the frontend container (Alpine doesn't have it by default)
docker exec frontend apk add --no-cache iputils

# Ping the API container by name
docker exec frontend ping -c 3 api
```

**Output** :
```
PING api (172.20.0.3): 56 data bytes
64 bytes from 172.20.0.3: seq=0 ttl=64 time=0.112 ms
64 bytes from 172.20.0.3: seq=1 ttl=64 time=0.098 ms
64 bytes from 172.20.0.3: seq=2 ttl=64 time=0.105 ms

--- api ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss
round-trip min/avg/max = 0.098/0.105/0.112 ms
```

**Magie** : "api" est automatiquement résolu vers l'IP du conteneur API !

### Connecter/déconnecter un conteneur en cours d'exécution

Parfois, tu veux changer le réseau d'un conteneur qui tourne déjà :

```bash
# Create a second network
docker network create admin-network

# Connect the API to this second network
docker network connect admin-network api

# Now api is on TWO networks: app-network AND admin-network
docker inspect api | grep -A 10 Networks
```

**Use case** : Ton conteneur API peut maintenant parler aux conteneurs sur `app-network` ET sur `admin-network` !

```bash
# Disconnect from a network
docker network disconnect admin-network api
```

**Schéma** :
```
Avant:
  ┌─────────────┐
  │ app-network │
  │  - database │
  │  - api      │
  │  - frontend │
  └─────────────┘

Après docker network connect:
  ┌─────────────┐          ┌──────────────┐
  │ app-network │          │admin-network │
  │  - database │          │              │
  │  - api ─────┼──────────┼─ api         │
  │  - frontend │          │              │
  └─────────────┘          └──────────────┘
```

---

## 7.5 Port publishing vs EXPOSE

C'est une confusion ULTRA courante chez les débutants. Clarifions une bonne fois pour toutes !

### EXPOSE : documentation uniquement

Le mot-clé `EXPOSE` dans un Dockerfile ne fait **RIEN** au niveau réseau. C'est juste de la doc pour les humains.

**Dockerfile** :
```dockerfile
FROM node:20

# This is ONLY documentation
EXPOSE 3000

CMD ["node", "server.js"]
```

```bash
# Build and run
docker build -t myapp .
docker run -d --name app myapp

# Try to access port 3000 from your machine
curl http://localhost:3000
# curl: (7) Failed to connect to localhost port 3000: Connection refused
```

**Pourquoi ça marche pas ?** Parce que `EXPOSE` ne publie PAS le port ! C'est juste un commentaire fancy.

### -p : publication RÉELLE de ports

Pour rendre un port accessible depuis ta machine, utilise `-p` (ou `--publish`) :

```bash
# Publish port 3000 from container to port 8080 on host
docker run -d --name app -p 8080:3000 myapp

# Now it works!
curl http://localhost:8080
# {"message": "Hello World"}
```

**Syntaxe** : `-p [host-port]:[container-port]`

```
┌───────────────────────────────┐
│    Ton ordinateur (host)      │
│                               │
│  Browser → localhost:8080     │
│               ↓               │
│            [Port 8080]        │
│               ↓               │
│  ┌─────────────────────────┐  │
│  │  Container              │  │
│  │  Port 3000 ←───────────┼──┼── Mapping -p 8080:3000
│  │  App écoute ici        │  │
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

### Exemples pratiques

```bash
# Publish multiple ports
docker run -d -p 8080:80 -p 8443:443 nginx

# Let Docker choose the host port automatically
docker run -d -p 80 nginx
# Docker assigns a random port like 32768

# Find out which port was assigned
docker port <container-name>
# 80/tcp -> 0.0.0.0:32768

# Publish on specific interface only (localhost)
docker run -d -p 127.0.0.1:8080:80 nginx
# Only accessible from localhost, not from network

# Publish ALL exposed ports automatically
docker run -d -P nginx
# -P (capital P) publishes all EXPOSE ports to random host ports
```

### Le tableau récap

| Commande        | Effet                                      | Accessible depuis host ? |
|-----------------|--------------------------------------------|--------------------------|
| `EXPOSE 3000`   | Documentation uniquement                   | ❌ Non                    |
| `-p 8080:3000`  | Publie 3000 → 8080                         | ✅ Oui (port 8080)        |
| `-p 3000`       | Publie 3000 → port random                  | ✅ Oui (port random)      |
| `-P`            | Publie tous EXPOSE → ports random          | ✅ Oui (ports random)     |

**Règle simple** : Si tu veux accéder au conteneur depuis l'extérieur, utilise `-p`. Sinon, les conteneurs communiquent entre eux via le réseau Docker sans `-p` !

---

## 7.6 DNS resolution entre conteneurs

Docker a un serveur DNS intégré qui fait de la magie. Voyons comment ça marche sous le capot.

### Le mécanisme

Quand tu crées un custom bridge network, Docker démarre automatiquement un serveur DNS interne :

```
┌───────────────────────────────────────────┐
│        Custom Network: app-network        │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │     Docker Embedded DNS Server      │  │
│  │        (127.0.0.11:53)              │  │
│  │                                     │  │
│  │  "web"      → 172.20.0.2            │  │
│  │  "api"      → 172.20.0.3            │  │
│  │  "database" → 172.20.0.4            │  │
│  └─────────────────────────────────────┘  │
│              ↑           ↑                │
│              │           │                │
│    ┌─────────┴─┐   ┌────┴──────┐          │
│    │    web    │   │    api    │          │
│    │ 172.20.0.2│   │ 172.20.0.3│          │
│    └───────────┘   └───────────┘          │
└───────────────────────────────────────────┘
```

### Résolution par nom de conteneur

```bash
# Create network and containers
docker network create app-network

docker run -d --name database \
  --network app-network \
  postgres:15

docker run -d --name api \
  --network app-network \
  alpine sleep 3600

# Check DNS resolution from inside the container
docker exec api nslookup database
```

**Output** :
```
Server:    127.0.0.11
Address 1: 127.0.0.11

Name:      database
Address 1: 172.20.0.2 database.app-network
```

Regarde : `127.0.0.11` est le DNS de Docker ! Il a converti "database" en IP.

### Network aliases : plusieurs noms pour un conteneur

Tu peux donner plusieurs noms DNS à un conteneur :

```bash
docker run -d --name postgres-primary \
  --network app-network \
  --network-alias db \
  --network-alias postgres \
  --network-alias primary \
  postgres:15

# All these work from another container:
docker exec api ping db        # works
docker exec api ping postgres  # works
docker exec api ping primary   # works
docker exec api ping postgres-primary  # works too
```

**Use case** : Si tu changes de serveur de DB (de `postgres-primary` à `postgres-secondary`), tu gardes l'alias `db` et ton code ne casse pas !

### Service discovery en pratique

Imagine une app Node.js qui se connecte à une DB :

**server.js** :
```javascript
const { Client } = require('pg');

// Use container name as hostname
const client = new Client({
  host: 'database',  // Docker DNS resolves this!
  port: 5432,
  user: 'postgres',
  password: 'secret',
  database: 'myapp'
});

client.connect()
  .then(() => console.log('Connected to database'))
  .catch(err => console.error('Connection error', err));
```

**Docker Compose** :
```yaml
version: '3.8'

services:
  api:
    build: .
    networks:
      - app-network
    depends_on:
      - database

  database:
    image: postgres:15
    networks:
      - app-network
    environment:
      POSTGRES_PASSWORD: secret

networks:
  app-network:
    driver: bridge
```

Quand tu lances `docker compose up`, l'API peut parler à `database` directement. Pas besoin de connaître l'IP, pas de config compliquée. Docker gère tout !

---

## 7.7 Network isolation (securite)

L'isolation réseau, c'est le concept de sécurité le plus important avec Docker. Principe simple : **ce qui n'a pas besoin de se parler ne devrait pas pouvoir se parler**.

### Pourquoi isoler ?

Imagine que ton frontend a une faille XSS. Un attaquant peut exécuter du code JavaScript. Mais si ton frontend n'a **aucun accès direct** à la database, l'attaquant ne peut pas voler tes données. C'est ça, l'isolation !

```
❌ Mauvaise architecture (tout communique) :
┌────────────────────────────────┐
│       app-network              │
│  ┌──────────┐   ┌──────────┐   │
│  │ frontend │───│ database │   │
│  └──────────┘   └──────────┘   │
│       │              ↑         │
│       │         ┌────┘         │
│       └─────────│ api          │
│                 └──────────┘   │
└────────────────────────────────┘
Frontend peut accéder direct à la DB = DANGER!


✅ Bonne architecture (isolation) :
┌──────────────────┐  ┌──────────────────┐
│  frontend-net    │  │   backend-net    │
│  ┌──────────┐    │  │   ┌──────────┐   │
│  │ frontend │    │  │   │ database │   │
│  └──────────┘    │  │   └──────────┘   │
│       │          │  │        ↑         │
│       │  ┌───────┼──┼────────┤         │
│       └──│  api  │  │        │         │
│          └───────┼──┼────────┘         │
└──────────────────┘  └──────────────────┘

API est sur les DEUX réseaux = pont sécurisé
Frontend ne peut PAS ping database = isolé
```

### Créer une architecture isolée

```bash
# Create two isolated networks
docker network create frontend-net
docker network create backend-net

# Database: ONLY on backend network
docker run -d --name database \
  --network backend-net \
  -e POSTGRES_PASSWORD=secret \
  postgres:15

# API: on BOTH networks (acts as a bridge)
docker run -d --name api \
  --network backend-net \
  -e DATABASE_URL=postgresql://postgres:secret@database:5432/mydb \
  myapi:latest

docker network connect frontend-net api

# Frontend: ONLY on frontend network
docker run -d --name frontend \
  --network frontend-net \
  -p 8080:80 \
  -e API_URL=http://api:3000 \
  myfrontend:latest
```

### Diagramme de l'isolation

```
┌─────────────────────────────────────────────────────────┐
│                  Ton ordinateur (host)                  │
│                                                         │
│  Internet ←→ Port 8080                                  │
│                  ↓                                      │
│  ┌─────────────────────────────────────────────────┐    │
│  │          frontend-net (172.20.0.0/16)           │    │
│  │                                                 │    │
│  │    ┌──────────┐         ┌─────────────┐        │    │
│  │    │ frontend │─────────│     api     │        │    │
│  │    │.20.0.2   │         │   .20.0.3   │        │    │
│  │    └──────────┘         └──────┬──────┘        │    │
│  │                                │               │    │
│  └────────────────────────────────┼───────────────┘    │
│                                   │                    │
│  ┌────────────────────────────────┼───────────────┐    │
│  │          backend-net (172.21.0.0/16)          │    │
│  │                         ┌──────┴──────┐       │    │
│  │                         │     api     │       │    │
│  │                         │   .21.0.2   │       │    │
│  │                         └──────┬──────┘       │    │
│  │                                │              │    │
│  │                         ┌──────┴──────┐       │    │
│  │                         │  database   │       │    │
│  │                         │   .21.0.3   │       │    │
│  │                         └─────────────┘       │    │
│  │                                               │    │
│  └───────────────────────────────────────────────┘    │
│                                                       │
└───────────────────────────────────────────────────────┘

Isolation:
✅ frontend → api (OK, même réseau)
❌ frontend → database (BLOQUÉ, réseaux différents)
✅ api → database (OK, même réseau)
✅ api → frontend (OK, API est sur les deux réseaux)
```

### Tester l'isolation

```bash
# This should WORK (same network)
docker exec frontend ping api
# PING api (172.20.0.3): 56 data bytes
# 64 bytes from 172.20.0.3: seq=0 ttl=64 time=0.089 ms

# This should FAIL (different networks)
docker exec frontend ping database
# ping: bad address 'database'

# But API can reach database (it's on backend-net)
docker exec api ping database
# PING database (172.21.0.3): 56 data bytes
# 64 bytes from 172.21.0.3: seq=0 ttl=64 time=0.112 ms
```

**Sécurité assurée !** Même si quelqu'un hack ton frontend, il ne peut pas atteindre ta database.

### Règles de sécurité réseau

1. **Principe du moindre privilège** : Chaque conteneur ne devrait avoir accès qu'aux réseaux dont il a VRAIMENT besoin.

2. **Segmentation** :
   - Frontend : réseau public
   - API/Backend : réseau intermédiaire
   - Database/Cache : réseau privé

3. **Pas de ports publiés pour les DB** : Jamais de `-p 5432:5432` pour Postgres en prod ! Seuls les conteneurs internes doivent y accéder.

4. **Utilise des network aliases** : Ça facilite les changements de conteneurs sans casser l'app.

---

## 7.8 Exercice pratique

Maintenant, à toi de jouer ! On va créer une archi complète avec isolation réseau.

### Objectif

Déployer une app avec :
- 1 réseau **frontend-net**
- 1 réseau **backend-net**
- 3 conteneurs : `nginx` (frontend), `api` (backend), `redis` (cache)

**Règles** :
- `nginx` doit pouvoir parler à `api`
- `api` doit pouvoir parler à `redis`
- `nginx` NE DOIT PAS pouvoir parler à `redis` (isolation!)

### Étape 1 : Créer les réseaux

```bash
# Create two networks
docker network create frontend-net
docker network create backend-net
```

### Étape 2 : Déployer les conteneurs

```bash
# Redis: ONLY on backend network (private)
docker run -d --name redis \
  --network backend-net \
  redis:7-alpine

# API: on backend network first
docker run -d --name api \
  --network backend-net \
  -e REDIS_HOST=redis \
  alpine sleep 3600

# Connect API to frontend network (bridge between networks)
docker network connect frontend-net api

# Nginx: ONLY on frontend network
docker run -d --name nginx \
  --network frontend-net \
  -p 8080:80 \
  nginx:alpine
```

### Étape 3 : Vérifier l'isolation

**Test 1** : nginx → api (devrait marcher)

```bash
docker exec nginx ping -c 2 api
```

**Résultat attendu** :
```
PING api (172.20.0.3): 56 data bytes
64 bytes from 172.20.0.3: seq=0 ttl=64 time=0.123 ms
64 bytes from 172.20.0.3: seq=1 ttl=64 time=0.098 ms
```

✅ **Succès !** nginx peut contacter l'API.

**Test 2** : nginx → redis (devrait échouer)

```bash
docker exec nginx ping -c 2 redis
```

**Résultat attendu** :
```
ping: bad address 'redis'
```

✅ **Succès !** nginx est isolé de redis. La sécurité fonctionne.

**Test 3** : api → redis (devrait marcher)

```bash
docker exec api ping -c 2 redis
```

**Résultat attendu** :
```
PING redis (172.21.0.2): 56 data bytes
64 bytes from 172.21.0.2: seq=0 ttl=64 time=0.089 ms
64 bytes from 172.21.0.2: seq=1 ttl=64 time=0.105 ms
```

✅ **Succès !** L'API peut contacter redis.

### Étape 4 : Inspecter la configuration

```bash
# See which networks nginx is on
docker inspect nginx | grep -A 10 Networks

# See which networks api is on (should show TWO networks)
docker inspect api | grep -A 20 Networks

# List all containers on frontend-net
docker network inspect frontend-net | grep -A 5 Containers
```

**Output pour l'API** :
```json
"Networks": {
    "backend-net": {
        "IPAddress": "172.21.0.3"
    },
    "frontend-net": {
        "IPAddress": "172.20.0.3"
    }
}
```

L'API a **deux IPs** : une sur chaque réseau. Elle agit comme un pont sécurisé !

### Étape 5 : Nettoyer

```bash
# Stop and remove all containers
docker rm -f nginx api redis

# Remove networks
docker network rm frontend-net backend-net
```

### Schéma final de l'exercice

```
┌───────────────────────────────────────────────┐
│                                               │
│  Internet → localhost:8080                    │
│                   ↓                           │
│  ┌──────────────────────────────────────┐     │
│  │       frontend-net                   │     │
│  │                                      │     │
│  │   ┌───────┐        ┌─────────┐      │     │
│  │   │ nginx │────────│   api   │      │     │
│  │   │ :80   │        │(bridge) │      │     │
│  │   └───────┘        └────┬────┘      │     │
│  │                         │           │     │
│  └─────────────────────────┼───────────┘     │
│                            │                 │
│  ┌─────────────────────────┼───────────┐     │
│  │       backend-net       │           │     │
│  │                    ┌────┴────┐      │     │
│  │                    │   api   │      │     │
│  │                    │(bridge) │      │     │
│  │                    └────┬────┘      │     │
│  │                         │           │     │
│  │                    ┌────┴────┐      │     │
│  │                    │  redis  │      │     │
│  │                    │  :6379  │      │     │
│  │                    └─────────┘      │     │
│  │                                     │     │
│  └─────────────────────────────────────┘     │
│                                               │
└───────────────────────────────────────────────┘

Flux de communication:
1. Internet → nginx (port 8080)
2. nginx → api (frontend-net)
3. api → redis (backend-net)
4. nginx ✗ redis (ISOLÉ!)
```

### Challenge bonus

Tu veux aller plus loin ? Essaie de :

1. **Ajouter un conteneur PostgreSQL** sur le réseau backend uniquement
2. **Installer curl** dans nginx et essayer de faire une requête HTTP vers l'API
3. **Créer un troisième réseau** `monitoring-net` et connecter tous les conteneurs dessus (pour un système de logs par exemple)
4. **Utiliser docker-compose** pour décrire cette architecture en YAML

---

## Récapitulatif

Bravo, tu maîtrises maintenant le networking Docker ! Voici ce qu'on a vu :

✅ **Types de réseaux** : bridge (default), host, none, custom bridge
✅ **Custom bridge** : DNS automatique par nom de conteneur (la vraie magie)
✅ **Gestion** : `network create`, `ls`, `inspect`, `rm`
✅ **Connexion** : `--network` au run, `network connect/disconnect` après
✅ **EXPOSE vs -p** : EXPOSE = doc, -p = vraie publication de ports
✅ **DNS** : serveur intégré à `127.0.0.11`, résolution automatique
✅ **Isolation** : réseaux séparés = sécurité renforcée

### Les commandes essentielles

```bash
# Create a custom network
docker network create mon-reseau

# Run a container on this network
docker run -d --name app --network mon-reseau nginx

# Connect a running container to a network
docker network connect autre-reseau app

# Inspect network configuration
docker network inspect mon-reseau

# Remove unused networks
docker network prune
```

### La règle d'or

**Utilise toujours des custom bridge networks pour tes apps multi-conteneurs.** C'est la clé pour une architecture propre, sécurisée et maintenable.

Prochaine étape : Docker Compose, pour orchestrer tout ça avec un simple fichier YAML ! 🚀
