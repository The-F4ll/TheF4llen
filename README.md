# TheF4llen - Jeu d'Équipe en Temps Réel

## Description
TheF4llen est un jeu d'équipe en temps réel où 4 joueurs doivent collaborer pour résoudre une série d'énigmes de programmation. Chaque joueur a un rôle unique et doit contribuer à la progression de l'équipe.

## Fonctionnalités
- Interface en temps réel avec WebSocket
- Système de progression par niveaux
- Timer synchronisé pour tous les joueurs
- Barre de statut des joueurs en temps réel
- Système de feedback visuel
- Éditeur de code intégré
- Système d'indices

## Technologies Utilisées
- Frontend : React.js
- Backend : Node.js avec Socket.IO
- Éditeur de code : Monaco Editor
- Styling : Tailwind CSS

## Installation

### Prérequis
- Node.js (v14 ou supérieur)
- npm ou yarn

### Installation du Backend
```bash
cd server
npm install
npm run dev
```

### Installation du Frontend
```bash
cd client
npm install
npm run dev
```

## Structure du Projet
```
TheF4llen/
├── client/                      # Application React
│   ├── public/                  # Fichiers statiques
│   │   ├── games.json          # Données des niveaux
│   │   └── index.html          # Page HTML principale
│   ├── src/
│   │   ├── components/         # Composants React
│   │   │   ├── PlayerBase.jsx  # Interface principale du joueur
│   │   │   ├── Home.jsx        # Page d'accueil
│   │   │   └── GameOver.jsx    # Écran de fin de partie
│   │   ├── App.jsx            # Point d'entrée React
│   │   ├── main.jsx           # Configuration React
│   │   └── index.css          # Styles globaux
│   ├── package.json           # Dépendances frontend
│   └── vite.config.js         # Configuration Vite
├── server/                     # Serveur WebSocket
│   ├── index.js               # Point d'entrée du serveur
│   ├── gameLogic.js           # Logique du jeu
│   ├── socketHandlers.js      # Gestionnaires d'événements Socket.IO
│   ├── package.json           # Dépendances backend
│   └── .env                   # Variables d'environnement
├── .gitignore                 # Fichiers ignorés par Git
├── README.md                  # Documentation
└── LICENSE                    # Licence du projet
```

### Description des Dossiers Principaux

#### Client
- `public/` : Contient les fichiers statiques accessibles publiquement
- `src/components/` : Composants React réutilisables
- `src/` : Code source principal de l'application

#### Server
- `index.js` : Point d'entrée du serveur et configuration Socket.IO
- `gameLogic.js` : Gestion de la logique du jeu et des niveaux
- `socketHandlers.js` : Gestion des événements WebSocket

### Fichiers de Configuration
- `package.json` : Dépendances et scripts npm
- `vite.config.js` : Configuration du bundler Vite
- `.env` : Variables d'environnement (non versionné)
- `.gitignore` : Configuration Git

## Règles du Jeu
1. Chaque niveau dure 15 minutes
2. Les joueurs doivent collaborer pour résoudre les énigmes
3. Chaque joueur a un rôle unique et des indices spécifiques
4. Les réponses sont validées en temps réel
5. Le jeu se termine quand tous les niveaux sont complétés ou quand le temps est écoulé

## Configuration
Le serveur WebSocket est configuré pour écouter sur le port 3001. Assurez-vous que ce port est disponible.
