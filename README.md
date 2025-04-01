# 🏔️ Mont Seraph - Challenge de Code Collaboratif

Un jeu collaboratif où 4 joueurs doivent travailler ensemble pour résoudre des énigmes de code et atteindre le sommet du Mont Seraph.

## 📋 Prérequis

- Node.js (v14 ou supérieur)
- npm (v6 ou supérieur)

## 🚀 Installation

1. Clonez le repository :
```bash
git clone [URL_DU_REPO]
cd mont-seraph
```

2. Installez les dépendances du serveur :
```bash
cd server
npm install
```

3. Installez les dépendances du client :
```bash
cd ../client
npm install
```

## 🎮 Lancement du jeu

1. Démarrez le serveur :
```bash
cd server
npm run dev
```

2. Dans un autre terminal, démarrez le client :
```bash
cd client
npm run dev
```

3. Ouvrez 4 navigateurs différents (ou fenêtres de navigation privée) à l'adresse :
```
http://localhost:5173
```

4. Chaque joueur doit cliquer sur son lien respectif (Joueur 1, 2, 3 ou 4)

## 🎯 Règles du jeu

- Chaque niveau dure 3 minutes
- Les joueurs doivent communiquer pour résoudre les énigmes
- Chaque joueur a besoin d'un indice d'un autre joueur
- Les soumissions de code doivent être synchronisées
- Une erreur ou une désynchronisation fait recommencer le niveau
- Le jeu se termine après 5 niveaux réussis

## 🏆 Niveaux

1. **La Pente Inaccessible** : Calculs d'angles et de forces
2. **Le Ravin des Ombres** : Détection d'obstacles et navigation
3. **Le Pont Suspendu** : Calculs de poids et de stabilité
4. **La Tempête de Glace** : Gestion de la température et de la solidité
5. **Le Sommet des Étoiles** : Décodage et construction du mot sacré

## 🛠️ Technologies utilisées

- Frontend : React + Tailwind CSS
- Backend : Node.js + WebSocket
- Éditeur de code : Monaco Editor
- Base de données : JSON (fichiers statiques)

## 📝 Structure du projet

```
mont-seraph/
├── client/                 # Application React
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── App.jsx       # Point d'entrée React
│   │   └── main.jsx      # Configuration React
│   └── package.json      # Dépendances frontend
├── server/                # Serveur WebSocket
│   ├── server.js         # Logique du serveur
│   ├── levels.json       # Configuration des niveaux
│   └── package.json      # Dépendances backend
└── README.md             # Documentation
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 