const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors({
  origin: 'http://10.6.2.29:5173',
  credentials: true
}));

// Servir le fichier games.json
app.get('/games.json', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/games.json'));
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://10.6.2.29:5173',
    credentials: true
  }
});

// État du jeu
const gameState = {
  rooms: {},
  timeLeft: 900000, // 15 minutes en millisecondes
  currentLevel: 1
};

// Charger les données du jeu
const gameData = JSON.parse(fs.readFileSync(path.join(__dirname, '../client/public/games.json'), 'utf8'));

// Création d'une nouvelle partie
function createGame(roomId) {
  gameState.rooms[roomId] = {
    players: new Set(),
    level: 1,
    timeLeft: 900000,
    timer: null,
    submissions: new Map(),
    completedLevels: new Set(),
    errorCounts: new Map() // Pour suivre le nombre d'erreurs par joueur
  };
}

// Vérifier si la réponse est correcte
function checkAnswer(level, playerId, answer) {
  const levelData = gameData.levels.find(l => l.level === level);
  if (!levelData) return false;

  const expectedResponse = levelData.response;

  console.log("expectedResponse", expectedResponse);
  console.log("answer", answer);

  // Convertir la réponse en string et la nettoyer
  const answerStr = String(answer).trim().toLowerCase().replace(/\s+/g, '');
  const expectedResponseStr = String(expectedResponse).trim().toLowerCase().replace(/\s+/g, '');

  return expectedResponseStr === answerStr;
}

// Gestion des salles d'attente
const waitingRooms = new Map();

// Fonction pour trouver ou créer une salle d'attente
function findOrCreateWaitingRoom() {
  for (const [roomId, room] of waitingRooms.entries()) {
    if (room.players.size < 4) {
      return roomId;
    }
  }
  // Créer une nouvelle salle si aucune n'est disponible
  const newRoomId = `room_${waitingRooms.size + 1}`;
  waitingRooms.set(newRoomId, {
    players: new Set(),
    roles: new Map()
  });
  return newRoomId;
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

    // Envoyer l'état des joueurs à tous les joueurs de la salle
    const playersStatus = {
      connectedPlayers: Array.from(room.players),
      submittedPlayers: Array.from(room.submissions.keys()),
      errorCounts: Object.fromEntries(room.errorCounts)
    };
    io.to(roomId).emit('PLAYERS_STATUS', playersStatus);
  });

  socket.on('SUBMIT_CODE', ({ roomId, playerId, code }) => {
    console.log(`${playerId} soumet du code dans la salle ${roomId}`);
    
    const room = gameState.rooms[roomId];
    if (!room) return;

    try {
      const isCorrect = checkAnswer(room.level, playerId, code);

      if (isCorrect) {
        room.submissions.set(playerId, code);
        room.errorCounts.set(playerId, 0); // Réinitialiser le compteur d'erreurs
        
        // Envoyer l'état des réponses à tous les joueurs de la salle
        const playersStatus = {
          connectedPlayers: Array.from(room.players),
          submittedPlayers: Array.from(room.submissions.keys()),
          errorCounts: Object.fromEntries(room.errorCounts)
        };
        io.to(roomId).emit('PLAYERS_STATUS', playersStatus);
        
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
        // Incrémenter le compteur d'erreurs
        const currentErrors = room.errorCounts.get(playerId) || 0;
        room.errorCounts.set(playerId, currentErrors + 1);
        
        // Envoyer l'état mis à jour
        const playersStatus = {
          connectedPlayers: Array.from(room.players),
          submittedPlayers: Array.from(room.submissions.keys()),
          errorCounts: Object.fromEntries(room.errorCounts)
        };
        io.to(roomId).emit('PLAYERS_STATUS', playersStatus);
        
        socket.emit('LEVEL_FAILED', {
          message: 'Votre réponse est incorrecte. Essayez encore !'
        });
      }
    } catch (error) {
      // Incrémenter le compteur d'erreurs
      const currentErrors = room.errorCounts.get(playerId) || 0;
      room.errorCounts.set(playerId, currentErrors + 1);
      
      // Envoyer l'état mis à jour
      const playersStatus = {
        connectedPlayers: Array.from(room.players),
        submittedPlayers: Array.from(room.submissions.keys()),
        errorCounts: Object.fromEntries(room.errorCounts)
      };
      io.to(roomId).emit('PLAYERS_STATUS', playersStatus);
      
      socket.emit('LEVEL_FAILED', {
        message: 'Erreur dans votre réponse : ' + error.message
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Un client s\'est déconnecté');
    
    // Gérer la déconnexion dans la salle d'attente
    for (const [roomId, room] of waitingRooms.entries()) {
      // Trouver le playerId associé à ce socket
      const playerId = Array.from(room.roles.entries())
        .find(([_, role]) => role === `player${socket.id}`)?.[0];
      
      if (playerId) {
        console.log(`${playerId} a quitté la salle d'attente ${roomId}`);
        room.players.delete(playerId);
        room.roles.delete(playerId);
        
        // Si la salle est vide, la supprimer
        if (room.players.size === 0) {
          console.log(`Suppression de la salle d'attente ${roomId} car vide`);
          waitingRooms.delete(roomId);
        } else {
          // Sinon, mettre à jour le statut des autres joueurs
          console.log(`Mise à jour du statut des joueurs dans la salle ${roomId}`);
          io.to(roomId).emit('PLAYERS_STATUS', {
            connectedPlayers: Array.from(room.players),
            roomId: roomId
          });
        }
        break;
      }
    }

    // Gérer la déconnexion dans la salle de jeu
    for (const [roomId, room] of Object.entries(gameState.rooms)) {
      if (room.players.has(socket.id)) {
        console.log(`${socket.id} a quitté la salle de jeu ${roomId}`);
        room.players.delete(socket.id);
        room.submissions.delete(socket.id);
        room.errorCounts.delete(socket.id);
        
        // Envoyer l'état mis à jour aux autres joueurs
        const playersStatus = {
          connectedPlayers: Array.from(room.players),
          submittedPlayers: Array.from(room.submissions.keys()),
          errorCounts: Object.fromEntries(room.errorCounts)
        };
        io.to(roomId).emit('PLAYERS_STATUS', playersStatus);
        break;
      }
    }
  });

  socket.on('JOIN_WAITING_ROOM', (data) => {
    const { playerId, role } = data;
    const roomId = findOrCreateWaitingRoom();
    const room = waitingRooms.get(roomId);

    // Ajouter le joueur à la salle avec son playerId
    room.players.add(playerId);
    room.roles.set(playerId, role);

    // Rejoindre la salle socket.io
    socket.join(roomId);

    // Émettre le statut des joueurs à tous les joueurs de la salle
    io.to(roomId).emit('PLAYERS_STATUS', {
      connectedPlayers: Array.from(room.players),
      roomId: roomId
    });

    // Si la salle est pleine, démarrer le jeu après 5 secondes
    if (room.players.size === 4) {
      setTimeout(() => {
        io.to(roomId).emit('GAME_START');
        // Nettoyer la salle d'attente
        waitingRooms.delete(roomId);
      }, 5000);
    }
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