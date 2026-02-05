---
title: "Les bases de Git"
description: "Apprendre a versionner son code avec Git et GitHub"
order: 2
duration: "25 min"
icon: "📚"
xpReward: 120
objectives:
  - "Comprendre le controle de version"
  - "Maitriser les commandes Git essentielles"
  - "Utiliser GitHub pour partager son code"
---

## 2.1 C'est quoi Git ?

### Analogie simple

Imagine que tu ecris un expose sur ton ordinateur. Tu fais des modifications,
mais parfois tu regrettes et tu voudrais revenir a la version d'hier.

**Sans Git** : tu fais des copies "expose_v1.docx", "expose_v2.docx", "expose_FINAL.docx",
"expose_FINAL_FINAL.docx"... c'est le bazar !

**Avec Git** : tu as **un seul fichier**, mais Git memorise **toutes les versions**.
Tu peux revenir en arriere a n'importe quel moment, comme une machine a remonter le temps.

```
Sans Git :                              Avec Git :

expose_v1.docx                          expose.docx
expose_v2.docx                            |
expose_v3_corrige.docx                    +-- Version 1 (lundi)
expose_FINAL.docx                         +-- Version 2 (mardi)
expose_FINAL2.docx                        +-- Version 3 (mercredi)
expose_VRAIMENT_FINAL.docx                +-- Version 4 (jeudi)
                                          |
LE BAZAR !                           Tu peux revenir a
                                     n'importe quelle version !
```

### Definition

Git est un **systeme de controle de version**. Il permet de :
- **Sauvegarder** chaque modification de ton code (comme des points de sauvegarde)
- **Revenir en arriere** si tu casses quelque chose
- **Travailler a plusieurs** sur le meme projet sans se marcher dessus
- **Partager** ton code en ligne (via GitHub, GitLab...)

---

## 2.2 Les concepts de base

### Le depot (repository)

Un **depot** (ou "repo") est un dossier de projet suivi par Git.

```bash
mon-projet/          <-- un dossier normal
  ├── .git/          <-- ce dossier cache = Git suit le projet !
  ├── index.html
  └── style.css
```

### Les 3 zones de Git

Git fonctionne avec 3 zones. C'est le concept le plus important a comprendre :

```
 1. WORKING DIRECTORY         2. STAGING AREA          3. REPOSITORY
    (Ton dossier)               (Zone de preparation)    (Historique)

  Tu modifies tes       -->   Tu choisis ce que     --> Tu sauvegardes
  fichiers ici                tu veux sauvegarder       definitivement

  [index.html modifie]  git add  [index.html pret]  git commit  [Version 3 sauvee]
  [style.css modifie]   ------>  [style.css pret]   -------->   "ajout du menu"
```

**Analogie du colis postal** :
1. **Working Directory** = ton bureau (tu travailles sur tes fichiers)
2. **Staging Area** = le carton (tu mets dedans ce que tu veux envoyer)
3. **Repository** = la poste (le colis est envoye et enregistre)

### Un commit, c'est quoi ?

Un **commit** = une **sauvegarde** avec un message qui explique ce que tu as fait.

```
Historique de commits :

  commit 3 : "ajout du formulaire de contact"    <-- le plus recent
      |
  commit 2 : "ajout de la page style.css"
      |
  commit 1 : "creation du projet avec index.html" <-- le premier
```

Chaque commit a :
- Un **identifiant unique** (un code comme `a1b2c3d`)
- Un **message** qui decrit le changement
- La **date** et l'**auteur**

---

## 2.3 Installation de Git

### Sur Windows

1. Telecharger Git : https://git-scm.com/download/win
2. Installer (garder les options par defaut)
3. Ouvrir "Git Bash" (installe automatiquement)

### Sur Mac

```bash
# Git est souvent deja installe. Sinon :
xcode-select --install
```

### Sur Linux

```bash
sudo apt update && sudo apt install git
```

### Verifier et configurer

```bash
# Verifier que Git est installe
git --version
# git version 2.x.x

# IMPORTANT : Configurer ton identite (une seule fois)
git config --global user.name "Ton Prenom Nom"
git config --global user.email "ton.email@exemple.com"

# Verifier la configuration
git config --list
```

---

## 2.4 Les commandes essentielles (les 10 a connaitre)

### Creer un projet Git

```bash
# Methode 1 : Creer un nouveau projet
mkdir mon-projet
cd mon-projet
git init
# "Initialized empty Git repository" --> Git suit maintenant ce dossier !

# Methode 2 : Recuperer un projet existant depuis GitHub
git clone https://github.com/utilisateur/projet.git
```

### Le cycle de travail quotidien

```bash
# 1. Voir l'etat de tes fichiers (modifies ? nouveaux ? prets ?)
git status

# 2. Ajouter des fichiers a la zone de preparation (staging)
git add index.html           # ajouter un fichier precis
git add index.html style.css # ajouter plusieurs fichiers
git add .                    # ajouter TOUS les fichiers modifies

# 3. Sauvegarder (commit) avec un message
git commit -m "ajout de la page d'accueil"

# 4. Voir l'historique des commits
git log
git log --oneline            # version compacte (plus lisible)
```

### Exemple complet pas a pas

```bash
# Creer un projet
mkdir mon-site && cd mon-site
git init

# Creer un fichier
echo "<h1>Hello</h1>" > index.html

# Verifier l'etat
git status
# --> "Untracked files: index.html" (Git voit le fichier mais ne le suit pas encore)

# Ajouter le fichier
git add index.html

# Verifier l'etat
git status
# --> "Changes to be committed: index.html" (pret a etre sauvegarde !)

# Sauvegarder
git commit -m "creation de la page d'accueil"
# --> [master (root-commit) a1b2c3d] creation de la page d'accueil

# Modifier le fichier
echo "<p>Bienvenue</p>" >> index.html

# Verifier, ajouter, sauvegarder
git status           # index.html = modified
git add index.html
git commit -m "ajout du texte de bienvenue"

# Voir l'historique
git log --oneline
# a1b2c3d creation de la page d'accueil
# f4e5d6c ajout du texte de bienvenue
```

---

## 2.5 GitHub : partager son code en ligne

### C'est quoi GitHub ?

**Git** = l'outil (sur ton PC)
**GitHub** = le site web (pour partager en ligne)

```
  TON PC                          GITHUB (en ligne)
  +----------+     git push      +----------+
  | Depot    | ----------------> | Depot    |
  | local    |                   | distant  |
  |          | <---------------- | (remote) |
  +----------+     git pull      +----------+
```

### Les commandes pour GitHub

```bash
# 1. Connecter ton projet local a GitHub
git remote add origin https://github.com/ton-nom/mon-projet.git

# 2. Envoyer ton code sur GitHub
git push -u origin main
#   "push" = pousser ton code vers le depot distant
#   "-u origin main" = sur le depot "origin", branche "main"

# 3. Recuperer les modifications depuis GitHub
git pull
#   "pull" = tirer les modifications des autres vers ton PC
```

### Creer un depot sur GitHub (step by step)

1. Va sur **github.com** et connecte-toi (ou cree un compte)
2. Clique sur **"+"** puis **"New repository"**
3. Donne un nom (ex: "mon-projet-docker")
4. **Ne coche PAS** "Add a README" (on va le faire depuis notre PC)
5. Clique sur **"Create repository"**
6. GitHub te donne les commandes a copier :

```bash
# Si tu as deja un projet local :
cd mon-projet
git remote add origin https://github.com/ton-nom/mon-projet-docker.git
git branch -M main
git push -u origin main

# Apres ca, pour les prochains push :
git push    # c'est tout !
```

---

## 2.6 Les branches (notion simplifiee)

### C'est quoi une branche ?

Une branche permet de **travailler sur une fonctionnalite** sans toucher au code principal.

```
main (code stable)  ─────●─────●─────●──────────●──────
                                      \         /
ma-branche                             ●───●───●
(nouvelle fonctionnalite)           tu travailles ici,
                                    puis tu "fusionnes"
                                    quand c'est pret
```

### Les commandes de base

```bash
# Voir les branches
git branch

# Creer une nouvelle branche et y aller
git checkout -b ma-nouvelle-branche

# Changer de branche
git checkout main          # retourner sur main
git checkout ma-branche    # aller sur ma-branche

# Fusionner une branche dans main
git checkout main                # d'abord aller sur main
git merge ma-nouvelle-branche    # fusionner

# Supprimer une branche (quand elle est fusionnee)
git branch -d ma-nouvelle-branche
```

### Exemple pratique

```bash
# Tu es sur "main" et tu veux ajouter un footer
git checkout -b ajout-footer

# Tu modifies tes fichiers...
echo "<footer>Mon footer</footer>" >> index.html
git add .
git commit -m "ajout du footer"

# Quand c'est pret, tu fusionnes
git checkout main
git merge ajout-footer

# Nettoyer
git branch -d ajout-footer
```

---

## 2.7 Le fichier .gitignore

Certains fichiers ne doivent **PAS** etre suivis par Git :
- Les mots de passe et cles secretes
- Les fichiers generes automatiquement
- Les dossiers tres lourds

Cree un fichier `.gitignore` a la racine de ton projet :

```
# Fichiers secrets (NE JAMAIS mettre sur GitHub !)
.env
*.key
credentials.json

# Dossiers de dependances (trop lourds, se regenerent)
node_modules/
vendor/

# Fichiers systeme
.DS_Store
Thumbs.db

# Fichiers de build
dist/
build/
```

---

## 2.8 Aide-memoire Git

```
╔══════════════════════════════════════════════════════════════╗
║                     GIT CHEAT SHEET                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                            ║
║  DEMARRER                                                  ║
║  git init                    Creer un depot Git            ║
║  git clone <url>             Copier un depot distant       ║
║                                                            ║
║  CYCLE QUOTIDIEN                                           ║
║  git status                  Voir l'etat des fichiers      ║
║  git add <fichier>           Preparer un fichier           ║
║  git add .                   Preparer tous les fichiers    ║
║  git commit -m "message"     Sauvegarder                   ║
║  git log --oneline           Voir l'historique             ║
║                                                            ║
║  GITHUB (DISTANT)                                          ║
║  git push                    Envoyer sur GitHub            ║
║  git pull                    Recuperer depuis GitHub       ║
║                                                            ║
║  BRANCHES                                                  ║
║  git branch                  Lister les branches           ║
║  git checkout -b <nom>       Creer + aller sur branche     ║
║  git checkout <nom>          Changer de branche            ║
║  git merge <nom>             Fusionner une branche         ║
║                                                            ║
║  ANNULER                                                   ║
║  git checkout -- <fichier>   Annuler modifs non ajoutees   ║
║  git reset HEAD <fichier>    Retirer du staging            ║
║                                                            ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 2.9 Exercice pratique : Git + Docker

Cet exercice combine Git et Docker pour preparer la suite du cours.

```bash
# 1. Creer le projet
mkdir mon-projet-docker && cd mon-projet-docker
git init

# 2. Creer le .gitignore
cat > .gitignore << 'EOF'
.env
*.log
EOF

# 3. Creer un fichier HTML simple
cat > index.html << 'EOF'
<h1>Hello Docker + Git !</h1>
EOF

# 4. Premier commit
git add .
git commit -m "initialisation du projet"

# 5. Creer un Dockerfile
cat > Dockerfile << 'EOF'
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
EXPOSE 80
EOF

# 6. Deuxieme commit
git add Dockerfile
git commit -m "ajout du Dockerfile"

# 7. Verifier l'historique
git log --oneline
# Tu devrais voir 2 commits !

# 8. (Optionnel) Pousser sur GitHub
# git remote add origin https://github.com/ton-nom/mon-projet-docker.git
# git push -u origin main
```

---

## 2.10 QCM Git (10 questions)

### G1. C'est quoi Git ?
- A) Un site web pour partager du code
- B) Un systeme de controle de version
- C) Un langage de programmation
- D) Un editeur de texte

### G2. Quelle commande cree un nouveau depot Git ?
- A) `git create`
- B) `git new`
- C) `git init`
- D) `git start`

### G3. Quelle commande montre l'etat des fichiers ?
- A) `git show`
- B) `git status`
- C) `git state`
- D) `git info`

### G4. Que fait `git add index.html` ?
- A) Cree le fichier index.html
- B) Supprime le fichier
- C) Ajoute le fichier a la zone de preparation (staging)
- D) Envoie le fichier sur GitHub

### G5. Que fait `git commit -m "mon message"` ?
- A) Envoie le code sur GitHub
- B) Sauvegarde les fichiers prepares avec un message descriptif
- C) Supprime les fichiers modifies
- D) Cree une nouvelle branche

### G6. Quelle est la difference entre Git et GitHub ?
- A) C'est la meme chose
- B) Git est l'outil local, GitHub est le service en ligne
- C) GitHub est plus recent et remplace Git
- D) Git est gratuit, GitHub est payant

### G7. Que fait `git push` ?
- A) Telecharge le code depuis GitHub
- B) Envoie tes commits locaux vers GitHub
- C) Cree un nouveau commit
- D) Supprime un depot

### G8. A quoi sert le fichier `.gitignore` ?
- A) A ignorer les erreurs Git
- B) A lister les fichiers que Git ne doit PAS suivre
- C) A configurer Git
- D) A supprimer des fichiers

### G9. Que fait `git checkout -b nouvelle-branche` ?
- A) Supprime la branche
- B) Cree une nouvelle branche et bascule dessus
- C) Fusionne les branches
- D) Affiche les branches

### G10. Dans quel ordre fait-on les operations pour sauvegarder ?
- A) commit → add → push
- B) push → add → commit
- C) add → commit → push
- D) commit → push → add

---

## 2.11 Reponses QCM Git

| Question | Reponse | Explication |
|----------|---------|-------------|
| G1  | **B** | Git est un outil de versioning, pas un site web (ca c'est GitHub) |
| G2  | **C** | `git init` initialise un nouveau depot dans le dossier courant |
| G3  | **B** | `git status` montre quels fichiers sont modifies, prepares, etc. |
| G4  | **C** | `git add` met le fichier dans la staging area (pret pour le commit) |
| G5  | **B** | `commit` cree une sauvegarde, `-m` ajoute le message |
| G6  | **B** | Git = outil local sur ton PC, GitHub = plateforme en ligne |
| G7  | **B** | `push` envoie tes commits du PC vers le depot distant (GitHub) |
| G8  | **B** | Les fichiers listes dans .gitignore ne seront jamais suivis par Git |
| G9  | **B** | `-b` cree la branche, `checkout` bascule dessus (2 en 1) |
| G10 | **C** | D'abord preparer (add), sauvegarder (commit), puis envoyer (push) |

---

