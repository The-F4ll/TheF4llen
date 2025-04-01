const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "http://10.6.2.29:5173"],
  methods: ["GET", "POST"],
  credentials: true
}));

// Servir le fichier games.json
app.get('/games.json', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/games.json'));
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://10.6.2.29:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// État du jeu
const gameState = {
  rooms: {},
  timeLeft: 180000, // 3 minutes en millisecondes
  currentLevel: 1
};

// Charger les données du jeu
const gameData = JSON.parse(fs.readFileSync(path.join(__dirname, '../client/public/games.json'), 'utf8'));

// Création d'une nouvelle partie
function createGame(roomId) {
  gameState.rooms[roomId] = {
    players: new Set(),
    level: 1,
    timeLeft: 180000,
    timer: null,
    submissions: new Map(),
    completedLevels: new Set()
  };
}

// Vérifier si la réponse est correcte
function checkAnswer(level, playerId, answer) {
  const levelData = gameData.levels.find(l => l.level === level);
  if (!levelData) return false;

  const expectedResponse = levelData.response;

  console.log("expectedResponse", expectedResponse);
  console.log("answer", answer);

  // Si la réponse attendue est un tableau
  if (Array.isArray(expectedResponse)) {
    // Essayer de parser la réponse si c'est une chaîne JSON
    let parsedAnswer = answer;
    try {
      if (typeof answer === 'string') {
        parsedAnswer = JSON.parse(answer);
      }
    } catch (e) {
      return false;
    }

    // Vérifier que les deux tableaux ont la même longueur et les mêmes valeurs
    if (!Array.isArray(parsedAnswer) || parsedAnswer.length !== expectedResponse.length) {
      return false;
    }
    return parsedAnswer.every((val, index) => val === expectedResponse[index]);
  }
  
  // Sinon, faire une comparaison stricte
  return answer === expectedResponse;
}

// Gestion des connexions
io.on('connection', (socket) => {
  console.log('Un client s\'est connecté');

  socket.on('JOIN_ROOM', ({ roomId, playerId }) => {
    console.log(`${playerId} rejoint la salle ${roomId}`);
    
    if (!gameState.rooms[roomId]) {
      createGame(roomId);
    }

    const room = gameState.rooms[roomId];
    room.players.add(playerId);
    socket.join(roomId);

    // Si c'est le premier joueur, démarrer le timer
    if (room.players.size === 1) {
      startTimer(roomId);
    }

    // Envoyer l'état actuel du jeu au nouveau joueur
    socket.emit('GAME_STATE', {
      level: room.level,
      timeLeft: room.timeLeft
    });
  });

  socket.on('SUBMIT_CODE', ({ roomId, playerId, code }) => {
    console.log(`${playerId} soumet du code dans la salle ${roomId}`);
    
    const room = gameState.rooms[roomId];
    if (!room) return;

    try {
      // Vérifier directement la réponse sans exécuter de code
      const isCorrect = checkAnswer(room.level, playerId, code);

      if (isCorrect) {
        room.submissions.set(playerId, code);
        
        // Si tous les joueurs ont soumis une réponse correcte
        if (room.submissions.size === room.players.size) {
          room.completedLevels.add(room.level);
          
          // Si c'était le dernier niveau
          if (room.level === 5) {
            io.to(roomId).emit('GAME_WON', {
              message: 'Félicitations ! Vous avez atteint le sommet du Mont Seraph !'
            });
            clearInterval(room.timer);
            return;
          }

          // Passer au niveau suivant
          room.level++;
          room.submissions.clear();
          io.to(roomId).emit('LEVEL_START', {
            level: room.level,
            timeLeft: room.timeLeft
          });
        } else {
          socket.emit('LEVEL_COMPLETED', {
            message: 'Votre réponse est correcte ! Attendez que les autres joueurs terminent.'
          });
        }
      } else {
        socket.emit('LEVEL_FAILED', {
          message: 'Votre réponse est incorrecte. Essayez encore !'
        });
      }
    } catch (error) {
      socket.emit('LEVEL_FAILED', {
        message: 'Erreur dans votre réponse : ' + error.message
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Un client s\'est déconnecté');
  });
});

// Fonction pour démarrer le timer
function startTimer(roomId) {
  const room = gameState.rooms[roomId];
  if (!room) return;

  room.timer = setInterval(() => {
    room.timeLeft -= 1000;
    io.to(roomId).emit('TIME_UPDATE', { timeLeft: room.timeLeft });

    if (room.timeLeft <= 0) {
      clearInterval(room.timer);
      io.to(roomId).emit('GAME_OVER', { message: 'Temps écoulé !' });
    }
  }, 1000);
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Serveur WebSocket en cours d'exécution sur le port ${PORT}`);
}); 