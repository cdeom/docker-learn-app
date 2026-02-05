// Quiz data for all QCM questions
// Topics map to course modules for score breakdown

export type QuizTopic = 'docker-basics' | 'wsl' | 'containers' | 'dockerfile' | 'compose';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: QuizTopic;
}

export const TOPIC_LABELS: Record<QuizTopic, string> = {
  'docker-basics': 'Bases Docker',
  'wsl': 'WSL2',
  'containers': 'Conteneurs',
  'dockerfile': 'Dockerfile',
  'compose': 'Docker Compose',
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Qu'est-ce qu'un conteneur Docker ?",
    options: [
      "Un logiciel de virtualisation comme VirtualBox",
      "Un environnement isole qui contient une application et ses dependances",
      "Un systeme d'exploitation complet",
      "Un outil de compilation de code",
    ],
    correctIndex: 1,
    explanation: "Un conteneur isole l'application avec ses dependances, ce n'est PAS une VM complete.",
    topic: 'docker-basics',
  },
  {
    id: 2,
    question: "Quelle est la difference entre une image et un conteneur ?",
    options: [
      "Il n'y a pas de difference",
      "L'image est en cours d'execution, le conteneur est le modele",
      "L'image est le modele (lecture seule), le conteneur est une instance en execution",
      "Le conteneur est plus leger que l'image",
    ],
    correctIndex: 2,
    explanation: "L'image est un modele en lecture seule, le conteneur est une instance vivante.",
    topic: 'docker-basics',
  },
  {
    id: 3,
    question: "A quoi sert WSL2 ?",
    options: [
      "A remplacer Windows par Linux",
      "A faire tourner un noyau Linux sous Windows",
      "A accelerer Docker sur Mac",
      "A compiler du code C++",
    ],
    correctIndex: 1,
    explanation: "WSL2 permet d'executer un vrai noyau Linux sous Windows.",
    topic: 'wsl',
  },
  {
    id: 4,
    question: "Quelle commande lance un conteneur en arriere-plan ?",
    options: [
      "docker run nginx",
      "docker run -d nginx",
      "docker start -background nginx",
      "docker run --silent nginx",
    ],
    correctIndex: 1,
    explanation: "Le flag `-d` signifie \"detached\" (arriere-plan).",
    topic: 'containers',
  },
  {
    id: 5,
    question: "Que fait `-p 8080:80` dans `docker run -p 8080:80 nginx` ?",
    options: [
      "Limite la memoire a 8080 MB et le CPU a 80%",
      "Mappe le port 80 du host vers le port 8080 du conteneur",
      "Mappe le port 8080 du host vers le port 80 du conteneur",
      "Ouvre les ports 8080 et 80 sur le host",
    ],
    correctIndex: 2,
    explanation: "Format : `-p HOST:CONTENEUR` → 8080 sur ton PC pointe vers 80 dans le conteneur.",
    topic: 'containers',
  },
  {
    id: 6,
    question: "Quelle commande permet de lister les conteneurs en cours d'execution ?",
    options: [
      "docker list",
      "docker containers",
      "docker ps",
      "docker running",
    ],
    correctIndex: 2,
    explanation: "`docker ps` liste les conteneurs actifs (`-a` pour tous).",
    topic: 'containers',
  },
  {
    id: 7,
    question: "Qu'est-ce qu'un Dockerfile ?",
    options: [
      "Un fichier de configuration JSON",
      "Un fichier texte contenant les instructions pour construire une image",
      "Un fichier binaire Docker",
      "Un fichier de logs",
    ],
    correctIndex: 1,
    explanation: "Le Dockerfile est un fichier texte avec les instructions de build.",
    topic: 'dockerfile',
  },
  {
    id: 8,
    question: "Que fait l'instruction `FROM nginx:alpine` dans un Dockerfile ?",
    options: [
      "Telecharge et installe Alpine Linux",
      "Definit l'image de base a partir de laquelle construire",
      "Lance un conteneur Nginx",
      "Copie les fichiers d'Alpine vers Nginx",
    ],
    correctIndex: 1,
    explanation: "`FROM` definit l'image de base, le point de depart.",
    topic: 'dockerfile',
  },
  {
    id: 9,
    question: "Quelle commande construit une image depuis un Dockerfile ?",
    options: [
      "docker create -t mon-image .",
      "docker compile -t mon-image .",
      "docker build -t mon-image .",
      "docker make -t mon-image .",
    ],
    correctIndex: 2,
    explanation: "`docker build` construit une image, `-t` donne un nom (tag).",
    topic: 'dockerfile',
  },
  {
    id: 10,
    question: "A quoi sert Docker Compose ?",
    options: [
      "A compiler du code Docker",
      "A definir et gerer des applications multi-conteneurs",
      "A remplacer Docker",
      "A creer des images plus rapidement",
    ],
    correctIndex: 1,
    explanation: "Docker Compose orchestre plusieurs conteneurs ensemble.",
    topic: 'compose',
  },
  {
    id: 11,
    question: "Quel est le format du fichier Docker Compose ?",
    options: [
      "JSON",
      "XML",
      "YAML",
      "TOML",
    ],
    correctIndex: 2,
    explanation: "Docker Compose utilise le format YAML (.yml).",
    topic: 'compose',
  },
  {
    id: 12,
    question: "Quelle commande lance tous les services definis dans docker-compose.yml ?",
    options: [
      "docker compose start",
      "docker compose run",
      "docker compose up",
      "docker compose launch",
    ],
    correctIndex: 2,
    explanation: "`docker compose up` cree et demarre tous les services.",
    topic: 'compose',
  },
  {
    id: 13,
    question: "Que fait `docker exec -it mon-conteneur bash` ?",
    options: [
      "Supprime le conteneur",
      "Ouvre un terminal interactif dans le conteneur",
      "Execute un script bash sur le host",
      "Redemarre le conteneur",
    ],
    correctIndex: 1,
    explanation: "`-it` = interactif + terminal, `bash` = ouvrir un shell.",
    topic: 'containers',
  },
  {
    id: 14,
    question: "Pourquoi preferer `nginx:alpine` a `nginx` ?",
    options: [
      "Alpine est plus securise",
      "Alpine est plus rapide",
      "Alpine est beaucoup plus leger (~43 MB vs ~187 MB)",
      "Alpine supporte plus de fonctionnalites",
    ],
    correctIndex: 2,
    explanation: "Alpine est une distro minimaliste, image 4x plus legere.",
    topic: 'dockerfile',
  },
  {
    id: 15,
    question: "Que fait l'instruction `COPY index.html /usr/share/nginx/html/` ?",
    options: [
      "Telecharge index.html depuis Internet",
      "Copie index.html depuis ton PC vers l'image",
      "Cree un nouveau fichier index.html vide",
      "Supprime l'ancien index.html",
    ],
    correctIndex: 1,
    explanation: "COPY copie des fichiers depuis le contexte de build vers l'image.",
    topic: 'dockerfile',
  },
  {
    id: 16,
    question: "Que fait `docker system prune` ?",
    options: [
      "Met a jour Docker",
      "Supprime tous les conteneurs en cours",
      "Supprime les ressources Docker inutilisees (conteneurs arretes, images orphelines, etc.)",
      "Reinstalle Docker",
    ],
    correctIndex: 2,
    explanation: "Nettoie les ressources non utilisees pour liberer de l'espace.",
    topic: 'docker-basics',
  },
  {
    id: 17,
    question: "Qu'est-ce que le flag `-v ~/data:/app/data` fait ?",
    options: [
      "Definit la version de Docker",
      "Active le mode verbose",
      "Monte un dossier du host dans le conteneur (volume)",
      "Verifie le conteneur",
    ],
    correctIndex: 2,
    explanation: "`-v` monte un volume : lie un dossier host a un dossier conteneur.",
    topic: 'containers',
  },
  {
    id: 18,
    question: "Que se passe-t-il si tu modifies un fichier HTML et que tu rafraichis la page (sans volume, image custom) ?",
    options: [
      "Le changement est visible immediatement",
      "Rien ne change car l'image doit etre reconstruite",
      "Docker detecte automatiquement les changements",
      "Le conteneur redemarre tout seul",
    ],
    correctIndex: 1,
    explanation: "Sans volume, les fichiers sont dans l'image, il faut rebuild.",
    topic: 'dockerfile',
  },
  {
    id: 19,
    question: "Quelle version de WSL est necessaire pour Docker ?",
    options: [
      "WSL1",
      "WSL2",
      "WSL3",
      "N'importe quelle version",
    ],
    correctIndex: 1,
    explanation: "Docker Desktop necessite WSL2 pour fonctionner sous Windows.",
    topic: 'wsl',
  },
  {
    id: 20,
    question: "Que fait `docker compose down` ?",
    options: [
      "Arrete les conteneurs seulement",
      "Arrete et supprime les conteneurs, reseaux et volumes anonymes du projet",
      "Supprime les images",
      "Desinstalle Docker Compose",
    ],
    correctIndex: 1,
    explanation: "`down` arrete et nettoie tout ce que `up` a cree.",
    topic: 'compose',
  },
];
