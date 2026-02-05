// Inline quiz questions for individual modules
// These are separate from the main QCM (module 6)

export interface InlineQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const GIT_QUESTIONS: InlineQuestion[] = [
  {
    id: 1,
    question: "A quoi sert Git ?",
    options: [
      "A compiler du code",
      "A versionner et suivre les modifications du code",
      "A deployer des applications",
      "A tester du code",
    ],
    correctIndex: 1,
    explanation: "Git est un systeme de controle de version qui permet de suivre chaque modification.",
  },
  {
    id: 2,
    question: "Que fait `git init` ?",
    options: [
      "Telecharge un depot distant",
      "Cree un nouveau depot Git local",
      "Supprime un depot Git",
      "Met a jour Git",
    ],
    correctIndex: 1,
    explanation: "`git init` initialise un nouveau depot Git dans le dossier courant.",
  },
  {
    id: 3,
    question: "Quelle commande permet d'ajouter des fichiers a la zone de staging ?",
    options: [
      "git commit",
      "git push",
      "git add",
      "git stage",
    ],
    correctIndex: 2,
    explanation: "`git add` ajoute les fichiers modifies a la zone de staging avant le commit.",
  },
  {
    id: 4,
    question: "Que fait `git commit -m 'message'` ?",
    options: [
      "Envoie le code sur GitHub",
      "Sauvegarde les changements stages avec un message",
      "Cree une nouvelle branche",
      "Fusionne deux branches",
    ],
    correctIndex: 1,
    explanation: "Le commit sauvegarde un snapshot des fichiers stages dans l'historique local.",
  },
  {
    id: 5,
    question: "Quelle est la difference entre `git pull` et `git push` ?",
    options: [
      "Il n'y a pas de difference",
      "pull envoie, push telecharge",
      "pull telecharge les changements distants, push envoie les locaux",
      "Les deux font la meme chose sur des branches differentes",
    ],
    correctIndex: 2,
    explanation: "`pull` recupere les modifications du serveur, `push` envoie vos commits vers le serveur.",
  },
  {
    id: 6,
    question: "Que fait `git status` ?",
    options: [
      "Affiche l'historique des commits",
      "Montre les fichiers modifies, stages et non suivis",
      "Affiche les branches",
      "Verifie la connexion a GitHub",
    ],
    correctIndex: 1,
    explanation: "`git status` montre l'etat actuel du depot : fichiers modifies, ajoutes ou non suivis.",
  },
  {
    id: 7,
    question: "A quoi sert un fichier `.gitignore` ?",
    options: [
      "A supprimer des fichiers du depot",
      "A lister les fichiers que Git doit ignorer",
      "A configurer les permissions Git",
      "A proteger les branches",
    ],
    correctIndex: 1,
    explanation: "Le `.gitignore` indique a Git quels fichiers/dossiers ne pas suivre (ex: node_modules).",
  },
  {
    id: 8,
    question: "Que fait `git clone <url>` ?",
    options: [
      "Cree une copie locale d'un depot distant",
      "Cree un nouveau depot vide",
      "Fusionne deux depots",
      "Sauvegarde le depot localement",
    ],
    correctIndex: 0,
    explanation: "`git clone` telecharge une copie complete d'un depot distant sur votre machine.",
  },
  {
    id: 9,
    question: "Que signifie un 'merge conflict' ?",
    options: [
      "Le depot est corrompu",
      "Deux personnes ont modifie les memes lignes de code",
      "La connexion a echoue",
      "Le commit est trop gros",
    ],
    correctIndex: 1,
    explanation: "Un conflit survient quand deux branches modifient la meme partie d'un fichier.",
  },
  {
    id: 10,
    question: "Quelle commande affiche l'historique des commits ?",
    options: [
      "git history",
      "git log",
      "git show",
      "git list",
    ],
    correctIndex: 1,
    explanation: "`git log` affiche la liste des commits avec auteur, date et message.",
  },
];

export const COMPOSE_QUESTIONS: InlineQuestion[] = [
  {
    id: 1,
    question: "Quel fichier Docker Compose utilise-t-il par defaut ?",
    options: [
      "docker-compose.json",
      "compose.yaml ou docker-compose.yml",
      "Dockerfile",
      "docker.config",
    ],
    correctIndex: 1,
    explanation: "Docker Compose cherche `compose.yaml`, `compose.yml`, `docker-compose.yml` ou `docker-compose.yaml`.",
  },
  {
    id: 2,
    question: "Que signifie `depends_on` dans un docker-compose.yml ?",
    options: [
      "Un service herite de la config d'un autre",
      "Un service demarre apres un autre",
      "Un service partage les volumes d'un autre",
      "Un service a le meme reseau qu'un autre",
    ],
    correctIndex: 1,
    explanation: "`depends_on` definit l'ordre de demarrage : le service attend que ses dependances soient lancees.",
  },
  {
    id: 3,
    question: "A quoi servent les volumes dans Docker Compose ?",
    options: [
      "A augmenter la memoire des conteneurs",
      "A persister des donnees meme si le conteneur est supprime",
      "A accelerer le demarrage",
      "A compresser les fichiers",
    ],
    correctIndex: 1,
    explanation: "Les volumes permettent de persister les donnees en dehors du cycle de vie du conteneur.",
  },
  {
    id: 4,
    question: "Que fait `docker compose up -d` ?",
    options: [
      "Demarre les services en mode debug",
      "Demarre les services en arriere-plan (detached)",
      "Telecharge les images seulement",
      "Supprime et recree les services",
    ],
    correctIndex: 1,
    explanation: "Le flag `-d` (detached) lance les conteneurs en arriere-plan.",
  },
  {
    id: 5,
    question: "Comment les services Docker Compose communiquent-ils entre eux ?",
    options: [
      "Via l'adresse IP de la machine",
      "Via le nom du service comme nom d'hote",
      "Ils ne peuvent pas communiquer",
      "Via des fichiers partages",
    ],
    correctIndex: 1,
    explanation: "Docker Compose cree un reseau ou chaque service est accessible par son nom.",
  },
  {
    id: 6,
    question: "Que fait `docker compose down -v` ?",
    options: [
      "Arrete les services en mode verbose",
      "Arrete les services et supprime les volumes",
      "Affiche la version",
      "Arrete un seul service",
    ],
    correctIndex: 1,
    explanation: "Le flag `-v` supprime aussi les volumes nommes declares dans le compose file.",
  },
  {
    id: 7,
    question: "Quelle section definit les variables d'environnement dans docker-compose.yml ?",
    options: [
      "config",
      "environment",
      "env_vars",
      "settings",
    ],
    correctIndex: 1,
    explanation: "La cle `environment` permet de definir des variables d'environnement pour un service.",
  },
  {
    id: 8,
    question: "Comment reconstruire les images apres modification du code ?",
    options: [
      "docker compose restart",
      "docker compose up --build",
      "docker compose rebuild",
      "docker compose update",
    ],
    correctIndex: 1,
    explanation: "`--build` force la reconstruction des images avant de demarrer les services.",
  },
  {
    id: 9,
    question: "Que fait `restart: unless-stopped` ?",
    options: [
      "Empeche le redemarrage du conteneur",
      "Redemarre le conteneur sauf s'il a ete arrete manuellement",
      "Redemarre le conteneur une seule fois",
      "Redemarre le conteneur toutes les 5 minutes",
    ],
    correctIndex: 1,
    explanation: "Le conteneur redemarre automatiquement sauf si vous l'arretez explicitement.",
  },
  {
    id: 10,
    question: "Quelle commande affiche les logs de tous les services ?",
    options: [
      "docker compose output",
      "docker compose logs",
      "docker compose print",
      "docker compose debug",
    ],
    correctIndex: 1,
    explanation: "`docker compose logs` affiche les logs. Ajoutez `-f` pour les suivre en temps reel.",
  },
];
