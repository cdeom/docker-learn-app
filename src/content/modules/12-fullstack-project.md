---
title: "Projet Full-Stack"
description: "Deployer une application complete avec Nginx, Node.js, React et MongoDB"
order: 12
duration: "60 min"
icon: "🎯"
xpReward: 400
objectives:
  - "Concevoir une architecture full-stack Docker"
  - "Deployer 4 services interconnectes"
  - "Appliquer toutes les bonnes pratiques apprises"
---

# Projet Full-Stack avec Docker

Bienvenue dans le module final ! On va construire ensemble une vraie application full-stack avec Docker. Pas un petit exemple, mais une app complète avec 4 services qui communiquent entre eux. C'est le moment de mettre en pratique tout ce que tu as appris !

## 12.1 Architecture du projet

Avant de coder, on va comprendre comment tout s'assemble. Voici l'architecture de notre application :

```
┌──────────────────────────────────────────────────────┐
│                    Navigateur                        │
└────────────┬─────────────────────────────────────────┘
             │ HTTP (port 80)
             ▼
┌────────────────────────────────────────────────────────┐
│                    Nginx (Proxy)                       │
│  • Reverse proxy pour l'API                            │
│  • Serveur web pour le frontend React                 │
└──────┬────────────────────────────┬────────────────────┘
       │                            │
       │ /api/* → backend:3000      │ / → static files
       │                            │
┌──────▼──────────────┐    ┌────────▼─────────────┐
│   Node.js API       │    │   React Frontend     │
│   (Express)         │    │   (fichiers static)  │
└──────┬──────────────┘    └──────────────────────┘
       │
       │ mongoose
       ▼
┌─────────────────────┐
│      MongoDB        │
│   (base de donnees) │
└─────────────────────┘
```

### Les réseaux Docker

On va créer **deux réseaux** pour isoler les services :

- **frontend-net** : Nginx ↔ API (accessible depuis l'extérieur)
- **backend-net** : API ↔ MongoDB (caché de l'extérieur)

MongoDB n'est accessible que par l'API, jamais directement depuis Internet. C'est une bonne pratique de sécurité !

### Pourquoi cette architecture ?

- **Nginx** : un seul point d'entrée, gère le SSL, le cache, et route intelligemment
- **API séparée** : facile à scaler, tester, et maintenir
- **Frontend statique** : rapide, peut être servi depuis un CDN
- **MongoDB isolé** : sécurité maximale

## 12.2 Le projet : Task Manager

On va construire un gestionnaire de tâches simple mais complet. C'est le genre d'app que tu pourrais vraiment utiliser !

### Fonctionnalités

- ✅ **Créer** une tâche
- 📋 **Lister** toutes les tâches
- ✏️ **Modifier** une tâche (marquer comme terminée)
- 🗑️ **Supprimer** une tâche

### Stack technique

- **Backend** : Node.js + Express + Mongoose
- **Frontend** : React (avec Vite)
- **Base de données** : MongoDB
- **Proxy** : Nginx
- **Orchestration** : Docker Compose

### Ce que tu vas apprendre

- Connecter des services entre eux
- Configurer un reverse proxy
- Utiliser les multi-stage builds
- Gérer les variables d'environnement
- Mettre en place des healthchecks
- Séparer la config dev/prod

## 12.3 Structure du projet

Commence par creer toute la structure de dossiers :

```bash
mkdir -p task-manager/{nginx,api/src/{models,routes},frontend/src,docs}
cd task-manager
```

Voici l'arborescence complète. Tu vas creer chaque fichier dans les sections suivantes :

```
task-manager/
├── docker-compose.yml          # Configuration dev
├── docker-compose.prod.yml     # Configuration prod
├── .env.example                # Template des variables
├── .gitignore
│
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf              # Configuration du reverse proxy
│
├── api/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── server.js           # Serveur Express
│   │   ├── models/
│   │   │   └── Task.js         # Modèle Mongoose
│   │   └── routes/
│   │       └── tasks.js        # Routes CRUD
│   └── .dockerignore
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── src/
│   │   ├── App.jsx             # Composant principal
│   │   ├── main.jsx
│   │   └── api.js              # Client HTTP
│   └── .dockerignore
│
└── docs/
    └── ARCHITECTURE.md
```

### Points importants

- Chaque service est **indépendant** (son propre package.json, Dockerfile)
- Les données MongoDB sont dans un **volume nommé** (persistance)
- Les configs dev et prod sont **séparées** (docker-compose.yml = dev, docker-compose.prod.yml = prod)
- Les secrets sont dans **.env** (jamais commités)

> **Important** : Avant de builder, il faut générer le `package-lock.json` dans chaque dossier qui a un `package.json`. Après avoir créé les fichiers, lance :
> ```bash
> cd api && npm install && cd ../frontend && npm install && cd ..
> ```
> Cela crée les fichiers `package-lock.json` nécessaires pour `npm ci` dans les Dockerfiles.

## 12.4 Backend Express + Mongoose

Le backend est une API REST classique. Allons-y étape par étape !

### package.json

```json
{
  "name": "task-manager-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### src/models/Task.js

Le modèle Mongoose pour une tâche :

```javascript
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  done: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Task', taskSchema);
```

### src/routes/tasks.js

Les routes CRUD :

```javascript
import express from 'express';
import Task from '../models/Task.js';

const router = express.Router();

// GET /api/tasks - List all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks - Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = new Task({ title, description });
    await task.save();

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, done } = req.body;

    const task = await Task.findByIdAndUpdate(
      id,
      { title, description, done },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
```

### src/server.js

Le serveur Express principal :

```javascript
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import taskRoutes from './routes/tasks.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/taskmanager';

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  res.json(health);
});

// Routes
app.use('/api/tasks', taskRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});
```

### api/Dockerfile

Un multi-stage build optimisé :

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Production stage
FROM node:20-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nodejs

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs src ./src
COPY --chown=nodejs:nodejs package*.json ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["npm", "start"]
```

### api/.dockerignore

Ne pas copier les fichiers inutiles :

```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
.dockerignore
Dockerfile
```

### Points clés du backend

- **Mongoose** gère la connexion à MongoDB
- **CORS** activé pour permettre les requêtes du frontend
- **Health check** pour Docker (vérifie que l'API répond)
- **Graceful shutdown** sur SIGTERM (ferme proprement la DB)
- **Validation** sur les entrées utilisateur
- **Gestion d'erreurs** centralisée

## 12.5 Frontend React

Le frontend est une SPA (Single Page Application) en React. Simple mais efficace !

### package.json

```json
{
  "name": "task-manager-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

### vite.config.js

Configuration Vite pour le proxy en dev :

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://api:3000',
        changeOrigin: true
      }
    }
  }
});
```

### index.html

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Manager</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

### src/main.jsx

Point d'entrée React :

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### src/api.js

Client HTTP pour communiquer avec l'API :

```javascript
const API_URL = '/api/tasks';

export async function fetchTasks() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

export async function createTask(title, description) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description })
  });
  if (!response.ok) {
    throw new Error('Failed to create task');
  }
  return response.json();
}

export async function updateTask(id, updates) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) {
    throw new Error('Failed to update task');
  }
  return response.json();
}

export async function deleteTask(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
  return response.json();
}
```

### src/App.jsx

Le composant principal (avec style inline pour simplifier) :

```javascript
import { useState, useEffect } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask } from './api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const task = await createTask(newTitle, newDescription);
      setTasks([task, ...tasks]);
      setNewTitle('');
      setNewDescription('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggle(task) {
    try {
      const updated = await updateTask(task._id, { done: !task.done });
      setTasks(tasks.map(t => t._id === task._id ? updated : t));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div style={styles.container}>Chargement...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📋 Task Manager</h1>

      {error && (
        <div style={styles.error}>
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleCreate} style={styles.form}>
        <input
          type="text"
          placeholder="Titre de la tâche"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={styles.input}
        />
        <textarea
          placeholder="Description (optionnel)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          style={styles.textarea}
        />
        <button type="submit" style={styles.button}>
          ➕ Ajouter
        </button>
      </form>

      <div style={styles.taskList}>
        {tasks.length === 0 ? (
          <p style={styles.empty}>Aucune tâche. Crée-en une !</p>
        ) : (
          tasks.map(task => (
            <div key={task._id} style={styles.task}>
              <div style={styles.taskContent}>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => handleToggle(task)}
                  style={styles.checkbox}
                />
                <div>
                  <h3 style={{
                    ...styles.taskTitle,
                    textDecoration: task.done ? 'line-through' : 'none',
                    opacity: task.done ? 0.6 : 1
                  }}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p style={styles.taskDescription}>{task.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(task._id)}
                style={styles.deleteButton}
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, sans-serif'
  },
  title: {
    textAlign: 'center',
    color: '#052FAD',
    marginBottom: '30px'
  },
  error: {
    padding: '10px',
    backgroundColor: '#fee',
    border: '1px solid #f88',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '30px'
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '4px'
  },
  textarea: {
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '4px',
    minHeight: '80px',
    fontFamily: 'inherit'
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#052FAD',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic'
  },
  task: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  taskContent: {
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-start',
    flex: 1
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    marginTop: '2px'
  },
  taskTitle: {
    margin: '0 0 5px 0',
    fontSize: '18px'
  },
  taskDescription: {
    margin: 0,
    color: '#666',
    fontSize: '14px'
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '5px'
  }
};

export default App;
```

### src/index.css

Un peu de style global :

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

button:hover {
  opacity: 0.9;
}

button:active {
  transform: scale(0.98);
}
```

### frontend/Dockerfile

Multi-stage build : on compile React, puis on sert les fichiers statiques avec Nginx :

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build React app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (if needed)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### frontend/.dockerignore

```
node_modules
dist
.env
.git
.gitignore
README.md
.dockerignore
Dockerfile
```

### Points clés du frontend

- **Vite** pour le build (super rapide !)
- **Multi-stage** : on ne garde que les fichiers buildés (dist)
- **Nginx alpine** pour servir les fichiers (léger et efficace)
- **React Hooks** : useState et useEffect
- **Gestion d'erreurs** avec try/catch
- **Loading state** pour une meilleure UX

## 12.6 Nginx reverse proxy

Nginx est le chef d'orchestre qui route les requêtes vers le bon service.

### nginx/nginx.conf

```nginx
# Top-level configuration
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging format
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss;

    # Upstream API server
    upstream api {
        server api:3000;
    }

    server {
        listen 80;
        server_name localhost;

        # Frontend static files
        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;

            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # API reverse proxy
        location /api/ {
            proxy_pass http://api;
            proxy_http_version 1.1;

            # Headers
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;

            # Buffering
            proxy_buffering off;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "OK\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### nginx/Dockerfile

```dockerfile
FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/nginx.conf

# Copy custom config
COPY nginx.conf /etc/nginx/nginx.conf

# Create cache directory
RUN mkdir -p /var/cache/nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Ce que fait Nginx

1. **Route /api/*** → backend API (proxy_pass)
2. **Route /** → fichiers statiques React
3. **Gzip** pour compresser les réponses
4. **Cache** des assets statiques (1 an)
5. **try_files** pour le routing React (SPA)
6. **Headers** pour identifier le client (X-Real-IP, etc.)

## 12.7 docker-compose.yml complet

Le fichier qui orchestre tout !

```yaml
version: '3.8'

services:
  # MongoDB database
  mongo:
    image: mongo:7
    container_name: taskmanager-mongo
    restart: unless-stopped
    volumes:
      - mongo-data:/data/db
    networks:
      - backend-net
    environment:
      MONGO_INITDB_DATABASE: taskmanager
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 20s

  # Node.js API
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: taskmanager-api
    restart: unless-stopped
    depends_on:
      mongo:
        condition: service_healthy
    environment:
      NODE_ENV: development
      PORT: 3000
      MONGO_URI: mongodb://mongo:27017/taskmanager
    networks:
      - frontend-net
      - backend-net
    volumes:
      - ./api/src:/app/src  # Hot reload in dev
    ports:
      - "3000:3000"  # Exposed for debugging

  # React frontend (dev mode with Vite)
  frontend-dev:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: taskmanager-frontend-dev
    restart: unless-stopped
    depends_on:
      - api
    volumes:
      - ./frontend/src:/app/src  # Hot reload
      - ./frontend/index.html:/app/index.html
    ports:
      - "5173:5173"
    networks:
      - frontend-net

  # Nginx reverse proxy
  nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile
    container_name: taskmanager-nginx
    restart: unless-stopped
    depends_on:
      api:
        condition: service_healthy
    ports:
      - "80:80"
    networks:
      - frontend-net
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro

networks:
  frontend-net:
    driver: bridge
  backend-net:
    driver: bridge

volumes:
  mongo-data:
    driver: local
```

### frontend/Dockerfile.dev

Pour le dev, on utilise Vite en mode dev (pas de build) :

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start dev server
CMD ["npm", "run", "dev"]
```

## 12.8 docker-compose.prod.yml

La configuration pour la production. Plus sécurisée et optimisée !

```yaml
version: '3.8'

services:
  mongo:
    image: mongo:7
    container_name: taskmanager-mongo-prod
    restart: always
    volumes:
      - mongo-data:/data/db
    networks:
      - backend-net
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: taskmanager
    healthcheck:
      test: ["CMD", "mongosh", "-u", "$MONGO_ROOT_USER", "-p", "$MONGO_ROOT_PASSWORD", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  api:
    build:
      context: ./api
      dockerfile: Dockerfile
      args:
        NODE_ENV: production
    container_name: taskmanager-api-prod
    restart: always
    depends_on:
      mongo:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 3000
      MONGO_URI: mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASSWORD}@mongo:27017/taskmanager?authSource=admin
    networks:
      - frontend-net
      - backend-net
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    # No volume mounts in prod (baked into image)
    # No exposed ports (only accessible via nginx)

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: taskmanager-frontend-prod
    restart: always
    networks:
      - frontend-net
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 128M
        reservations:
          cpus: '0.1'
          memory: 64M
    logging:
      driver: "json-file"
      options:
        max-size: "5m"
        max-file: "3"

  nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile
    container_name: taskmanager-nginx-prod
    restart: always
    depends_on:
      api:
        condition: service_healthy
      frontend:
        condition: service_healthy
    ports:
      - "80:80"
      - "443:443"  # For SSL
    networks:
      - frontend-net
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      # - ./certs:/etc/nginx/certs:ro  # SSL certificates
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  frontend-net:
    driver: bridge
  backend-net:
    driver: bridge
    internal: true  # Isolate backend network

volumes:
  mongo-data:
    driver: local
```

### Différences dev vs prod

| Aspect | Dev | Prod |
|--------|-----|------|
| **Restart** | unless-stopped | always |
| **Volumes** | Code monté (hot reload) | Rien (code dans l'image) |
| **Ports** | Exposés (debug) | Cachés (via nginx only) |
| **Resources** | Illimitées | Limitées (CPU/RAM) |
| **Logging** | Verbeux | Limité (rotation) |
| **Secrets** | .env simple | Variables sécurisées |
| **Frontend** | Vite dev server | Build statique |
| **MongoDB** | Sans auth | Avec user/password |
| **Network backend** | Public | Internal (isolé) |

## 12.9 Variables d'environnement

### .env.example

Template à copier en `.env` :

```bash
# Application
NODE_ENV=development

# API
PORT=3000

# MongoDB (development)
MONGO_URI=mongodb://mongo:27017/taskmanager

# MongoDB (production)
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=changeme_in_production_!@#
```

### .env (pour le dev)

```bash
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://mongo:27017/taskmanager
```

### .env.prod (pour la production)

```bash
NODE_ENV=production
PORT=3000
MONGO_ROOT_USER=taskmanager_admin
MONGO_ROOT_PASSWORD=Sup3rS3cur3P@ssw0rd!2024
```

### .gitignore

**IMPORTANT** : ne jamais commit les secrets !

```
# Dependencies
node_modules/
npm-debug.log*

# Environment
.env
.env.prod
.env.local

# Build
dist/
build/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Docker
*.log
```

## 12.10 Lancement et test

Maintenant, on met tout en route ! Suis ces étapes dans l'ordre.

### Étape 1 : Créer le .env

```bash
cd task-manager
cp .env.example .env
```

Vérifie que `.env` contient les bonnes valeurs.

### Étape 2 : Build des images

```bash
docker compose build
```

Tu devrais voir :

```
[+] Building 45.3s (32/32) FINISHED
 => [api builder 1/4] FROM docker.io/library/node:20-alpine
 => [frontend builder 1/5] FROM docker.io/library/node:20-alpine
 => [nginx 1/3] FROM docker.io/library/nginx:alpine
...
```

### Étape 3 : Lancer les services

```bash
docker compose up -d
```

Sortie attendue :

```
[+] Running 5/5
 ✔ Network taskmanager_frontend-net  Created
 ✔ Network taskmanager_backend-net   Created
 ✔ Container taskmanager-mongo       Started
 ✔ Container taskmanager-api         Started
 ✔ Container taskmanager-nginx       Started
```

### Étape 4 : Vérifier le statut

```bash
docker compose ps
```

Tous les services doivent être "Up" et "healthy" :

```
NAME                    STATUS              PORTS
taskmanager-mongo       Up (healthy)        27017/tcp
taskmanager-api         Up (healthy)        0.0.0.0:3000->3000/tcp
taskmanager-frontend    Up (healthy)        80/tcp
taskmanager-nginx       Up (healthy)        0.0.0.0:80->80/tcp
```

### Étape 5 : Consulter les logs

```bash
# Tous les services
docker compose logs -f

# Un service spécifique
docker compose logs -f api
```

Tu devrais voir :

```
taskmanager-mongo  | {"t":{"$date":"..."},"s":"I","c":"NETWORK","msg":"Listening on","attr":{"address":"0.0.0.0"}}
taskmanager-api    | Connected to MongoDB
taskmanager-api    | API server listening on port 3000
taskmanager-nginx  | /docker-entrypoint.sh: Configuration complete; ready for start up
```

### Étape 6 : Tester l'API avec curl

```bash
# Health check
curl http://localhost/api/health

# Créer une tâche
curl -X POST http://localhost/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Ma première tâche", "description": "Test depuis curl"}'

# Lister les tâches
curl http://localhost/api/tasks
```

Réponse attendue :

```json
[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Ma première tâche",
    "description": "Test depuis curl",
    "done": false,
    "createdAt": "2024-01-13T10:30:00.000Z"
  }
]
```

### Étape 7 : Tester le frontend

Ouvre ton navigateur à `http://localhost`

Tu devrais voir l'interface Task Manager ! Essaie de :

1. Créer une nouvelle tâche
2. Marquer une tâche comme terminée
3. Supprimer une tâche

### Étape 8 : Inspecter la base de données

```bash
# Se connecter à MongoDB
docker compose exec mongo mongosh taskmanager

# Dans le shell Mongo
db.tasks.find().pretty()
```

### Commandes utiles

```bash
# Arrêter les services
docker compose down

# Arrêter ET supprimer les volumes (reset complet)
docker compose down -v

# Rebuild une image spécifique
docker compose build api

# Redémarrer un service
docker compose restart api

# Voir les ressources utilisées
docker stats

# Voir les réseaux
docker network ls

# Inspecter un réseau
docker network inspect taskmanager_frontend-net
```

### Dépannage

**Problème** : "Connection refused" à l'API

```bash
# Vérifier que l'API est bien démarrée
docker compose logs api

# Vérifier le health check
docker inspect taskmanager-api | grep -A 10 Health
```

**Problème** : MongoDB ne démarre pas

```bash
# Voir les logs
docker compose logs mongo

# Supprimer le volume et redémarrer
docker compose down -v
docker compose up -d
```

**Problème** : Le frontend ne se charge pas

```bash
# Vérifier les logs Nginx
docker compose logs nginx

# Vérifier la conf Nginx
docker compose exec nginx cat /etc/nginx/nginx.conf
```

## 12.11 Pipeline CI/CD complet

On va créer un workflow GitHub Actions qui build et push automatiquement les images.

### .github/workflows/ci-cd.yml

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  DOCKER_REGISTRY: docker.io
  DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
  IMAGE_TAG: ${{ github.sha }}

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: api/package-lock.json

      - name: Install API dependencies
        working-directory: ./api
        run: npm ci

      - name: Run API tests
        working-directory: ./api
        run: npm test || echo "No tests yet"

      - name: Install frontend dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Build frontend
        working-directory: ./frontend
        run: npm run build

  build-and-push:
    name: Build and Push Docker Images
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push'

    strategy:
      matrix:
        service: [api, frontend, nginx]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ secrets.DOCKER_USERNAME }}/taskmanager-${{ matrix.service }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./${{ matrix.service }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          platforms: linux/amd64,linux/arm64

  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build-and-push
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/taskmanager
            git pull origin main
            docker compose -f docker-compose.prod.yml pull
            docker compose -f docker-compose.prod.yml up -d
            docker image prune -f

      - name: Health check
        run: |
          sleep 10
          curl -f http://${{ secrets.VPS_HOST }}/api/health || exit 1
```

### Secrets à configurer sur GitHub

Dans les settings du repo, ajoute ces secrets :

- `DOCKER_USERNAME` : ton username Docker Hub
- `DOCKER_PASSWORD` : ton token Docker Hub
- `VPS_HOST` : IP de ton serveur
- `VPS_USER` : user SSH (ex: root)
- `VPS_SSH_KEY` : clé privée SSH

### Ce que fait le pipeline

1. **Test** : vérifie que le code compile
2. **Build** : crée les 3 images Docker (api, frontend, nginx)
3. **Push** : envoie les images sur Docker Hub
4. **Deploy** : se connecte au VPS et met à jour les services
5. **Health check** : vérifie que l'app répond

## 12.12 Bonus : déploiement sur un VPS

Tu veux mettre ton app en ligne ? Voici les étapes !

### Prérequis

- Un VPS (DigitalOcean, OVH, Scaleway, etc.)
- Ubuntu 22.04 installé
- Accès SSH

### Étape 1 : Installer Docker sur le VPS

```bash
# Se connecter en SSH
ssh root@ton-serveur.com

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installer Docker Compose
apt install docker-compose-plugin

# Vérifier
docker --version
docker compose version
```

### Étape 2 : Cloner le projet

```bash
# Créer le répertoire
mkdir -p /opt/taskmanager
cd /opt/taskmanager

# Cloner depuis GitHub
git clone https://github.com/ton-username/task-manager.git .

# Copier la config prod
cp .env.example .env.prod
nano .env.prod  # Éditer avec de vrais secrets
```

### Étape 3 : Configurer le firewall

```bash
# Installer ufw
apt install ufw

# Autoriser SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Activer
ufw enable
```

### Étape 4 : Lancer l'application

```bash
# Build et démarrer en prod
docker compose -f docker-compose.prod.yml up -d --build

# Vérifier
docker compose -f docker-compose.prod.yml ps
```

### Étape 5 : Configurer un nom de domaine

Chez ton registrar (ex: OVH, Gandi) :

1. Crée un enregistrement **A** : `taskmanager.tondomaine.com` → IP du VPS
2. Attends la propagation DNS (5-30 min)

### Étape 6 : Ajouter SSL avec Let's Encrypt

```bash
# Installer Certbot
apt install certbot python3-certbot-nginx

# Obtenir un certificat
certbot --nginx -d taskmanager.tondomaine.com

# Renouvellement automatique (déjà configuré)
systemctl status certbot.timer
```

### Étape 7 : Monitoring avec Portainer (optionnel)

```bash
# Installer Portainer
docker volume create portainer_data

docker run -d \
  -p 9443:9443 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

Accède à `https://ton-serveur.com:9443` pour gérer tes conteneurs visuellement.

### Et après ? Scaler avec Docker Swarm

Si ton app devient populaire, tu peux scaler avec Docker Swarm :

```bash
# Initialiser un swarm
docker swarm init

# Déployer en mode swarm
docker stack deploy -c docker-compose.prod.yml taskmanager

# Scaler l'API à 3 instances
docker service scale taskmanager_api=3

# Voir les services
docker service ls
```

### Ou passer à Kubernetes

Pour les très grosses apps :

- **Kubernetes** (K8s) : orchestration avancée
- **Helm** : package manager pour K8s
- **Ingress** : routing intelligent
- **HPA** : autoscaling automatique

Mais Docker Compose suffit pour 95% des projets !

---

## Récapitulatif

Bravo ! Tu as construit une application full-stack complète avec Docker. Regardons ce que tu as appris :

### Architecture

- ✅ **4 services** interconnectés (Nginx, API, Frontend, MongoDB)
- ✅ **2 réseaux** pour isoler les couches
- ✅ **Volumes nommés** pour la persistance
- ✅ **Reverse proxy** avec Nginx
- ✅ **Health checks** sur tous les services

### Développement

- ✅ **Multi-stage builds** pour optimiser les images
- ✅ **Hot reload** en dev avec des volumes montés
- ✅ **Variables d'environnement** pour la config
- ✅ **Separation dev/prod** avec 2 docker-compose

### Production

- ✅ **Resource limits** (CPU/RAM)
- ✅ **Restart policies** (always)
- ✅ **Log rotation** pour éviter de saturer le disque
- ✅ **Secrets management** avec .env.prod
- ✅ **Network isolation** (backend internal)

### DevOps

- ✅ **CI/CD pipeline** avec GitHub Actions
- ✅ **Multi-architecture** builds (amd64 + arm64)
- ✅ **Automated deployment** sur un VPS
- ✅ **Health checks** après déploiement

### Best Practices

- ✅ **Non-root users** dans les conteneurs
- ✅ **.dockerignore** pour des builds rapides
- ✅ **Layer caching** avec npm ci avant COPY
- ✅ **Graceful shutdown** dans l'API
- ✅ **CORS** configuré correctement
- ✅ **Gzip** pour compresser les réponses
- ✅ **Cache des assets** statiques

### Ce que tu peux faire maintenant

Tu as toutes les compétences pour :

1. **Dockeriser n'importe quelle app** (backend, frontend, DB)
2. **Orchestrer des services** avec Docker Compose
3. **Déployer en production** sur un VPS
4. **Mettre en place un pipeline CI/CD**
5. **Scaler une app** avec Docker Swarm
6. **Débugger** des problèmes de conteneurs

### Prochaines étapes

Si tu veux aller plus loin :

- 📘 Ajoute des **tests** (Jest pour l'API, Cypress pour le frontend)
- 🔒 Implemente l'**authentification** (JWT)
- 📊 Ajoute du **monitoring** (Prometheus + Grafana)
- 🚀 Déploie sur **Kubernetes** (minikube pour tester)
- 🌍 Configure un **load balancer** (HAProxy, Traefik)
- 📦 Crée des **Helm charts** pour K8s

### Ressources utiles

- 📖 [Documentation Docker](https://docs.docker.com/)
- 🐙 [Docker Hub](https://hub.docker.com/) (images officielles)
- 💬 [Docker Community](https://forums.docker.com/)
- 🎓 [Play with Docker](https://labs.play-with-docker.com/) (sandbox gratuit)
- 📺 [Docker YouTube](https://www.youtube.com/c/DockerIo)

---

## Mission finale

Pour valider ce module, construis ta propre app full-stack !

Quelques idées :

- 🎮 **Scoreboard** pour jeux vidéo
- 📝 **Blog** avec commentaires
- 💬 **Chat** en temps réel (Socket.io)
- 🎬 **Watchlist** de films/séries
- 🏋️ **Workout tracker** pour le sport

**Critères** :

- Au moins 3 services Docker
- Un docker-compose.yml fonctionnel
- Un README avec les instructions
- Une API REST documentée
- Un frontend responsive

Partage ton projet sur GitHub et tweet-le avec `#DockerLearning` ! 🚀

---

Félicitations, tu es maintenant un pro de Docker ! 🎉

Tu as parcouru un long chemin depuis les bases (module 1) jusqu'à ce projet complet. Docker n'a plus de secrets pour toi. Continue à pratiquer, teste des nouvelles technos, et surtout : **build cool stuff** !

Happy coding! 🐳✨
