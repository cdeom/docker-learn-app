---
title: "Deployer un conteneur Nginx"
description: "Lancer son premier conteneur Docker avec Nginx"
order: 3
duration: "20 min"
icon: "🚀"
xpReward: 200
objectives:
  - "Telecharger et lancer une image Docker"
  - "Comprendre les ports et volumes"
  - "Explorer un conteneur en cours d'execution"
---

## 3.1 Exercice pratique step-by-step

### Etape 1 : Telecharger et lancer Nginx

```bash
# Telecharger l'image nginx
docker pull nginx

# Verifier qu'elle est la
docker images
```

Tu devrais voir :
```
REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
nginx        latest    a8758716bb6a   2 weeks ago   187MB
```

### Etape 2 : Lancer le conteneur

```bash
# Lancer nginx en arriere-plan, avec le port 8080
docker run -d --name mon-premier-site -p 8080:80 nginx
```

Explication de chaque partie :
- `docker run` : creer et demarrer un conteneur
- `-d` : en arriere-plan (detached)
- `--name mon-premier-site` : nom du conteneur
- `-p 8080:80` : port 8080 de ton PC = port 80 du conteneur
- `nginx` : image a utiliser

### Etape 3 : Tester !

Ouvre ton navigateur et va sur : **http://localhost:8080**

Tu devrais voir la page par defaut de Nginx :

```
Welcome to nginx!
If you see this page, the nginx web server is successfully installed...
```

**Felicitations ! Tu viens de deployer ton premier conteneur Docker !**

### Etape 4 : Explorer le conteneur

```bash
# Voir les conteneurs en cours
docker ps

# Voir les logs
docker logs mon-premier-site

# Entrer dans le conteneur
docker exec -it mon-premier-site bash

# Une fois dedans, tu peux explorer :
ls /usr/share/nginx/html/
# Tu verras : index.html  50x.html

cat /usr/share/nginx/html/index.html
# C'est la page que tu vois dans ton navigateur !

# Pour sortir du conteneur :
exit
```

### Etape 5 : Arreter et nettoyer

```bash
# Arreter le conteneur
docker stop mon-premier-site

# Verifier (il ne devrait plus apparaitre)
docker ps

# Le voir dans les conteneurs arretes
docker ps -a

# Supprimer le conteneur
docker rm mon-premier-site

# Verifier
docker ps -a
```

---

## 3.2 Exercice bonus : Monter un volume

Au lieu de modifier les fichiers DANS le conteneur, on peut "monter" un dossier
de ton PC dans le conteneur.

```bash
# Creer un dossier sur ton PC
mkdir -p ~/mon-site
echo "<h1>Hello depuis mon PC !</h1>" > ~/mon-site/index.html

# Lancer nginx avec un volume
docker run -d \
  --name mon-site-custom \
  -p 8080:80 \
  -v ~/mon-site:/usr/share/nginx/html:ro \
  nginx
```

Le flag `-v` explique :
```
-v ~/mon-site:/usr/share/nginx/html:ro
   |           |                       |
   |           |                       +-- ro = read-only (securite)
   |           +-- Chemin DANS le conteneur
   +-- Chemin sur TON PC
```

Va sur **http://localhost:8080** → tu verras "Hello depuis mon PC !"

Modifie le fichier `~/mon-site/index.html` → rafraichis la page → le changement
est immediat !

```bash
# Nettoyer
docker stop mon-site-custom && docker rm mon-site-custom
```

---

