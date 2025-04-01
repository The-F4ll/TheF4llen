import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';

function WaitingRoom() {
  const { playerNumber } = useParams();
  const [connectedPlayers, setConnectedPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const navigate = useNavigate();
  const socketRef = useRef(null);

  // Déterminer la couleur en fonction du numéro de joueur
  const getColor = (num) => {
    const colors = {
      1: 'blue',
      2: 'green',
      3: 'purple',
      4: 'red'
    };
    return colors[num] || 'gray';
  };

  // Déterminer le rôle en fonction du numéro de joueur
  const getRole = (num) => {
    const roles = {
      1: 'Le Calculateur d\'Angles',
      2: 'Le Calculateur de Force',
      3: 'Le Physicien',
      4: 'Le Vérificateur de Stabilité'
    };
    return roles[num] || 'Joueur';
  };

  useEffect(() => {
    // Connexion WebSocket
    socketRef.current = io('http://10.6.2.29:3001', {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });
    
    socketRef.current.on('connect', () => {
      setIsDisconnected(false);
      socketRef.current.emit('JOIN_WAITING_ROOM', {
        playerId: `player${playerNumber}`,
        role: getRole(playerNumber)
      });
    });

    socketRef.current.on('disconnect', () => {
      setIsDisconnected(true);
      setConnectedPlayers([]);
      setRoomId(null);
    });

    socketRef.current.on('PLAYERS_STATUS', (data) => {
      setConnectedPlayers(data.connectedPlayers);
      setRoomId(data.roomId);
    });

    socketRef.current.on('GAME_START', () => {
      setCountdown(5);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [playerNumber]);

  useEffect(() => {
    let timer;
    if (countdown !== null) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setShouldNavigate(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [countdown]);

  // Effet séparé pour la navigation
  useEffect(() => {
    if (shouldNavigate) {
      navigate(`/player/${playerNumber}`);
    }
  }, [shouldNavigate, navigate, playerNumber]);

  return (
    <div className={`min-h-screen bg-${getColor(playerNumber)}-900 text-white p-4 flex items-center justify-center`}>
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Salle d'Attente</h1>
          <p className="text-xl text-gray-300">
            {roomId ? `Salle ${roomId.split('_')[1]}` : 'En attente...'}
          </p>
        </div>

        {/* Message de déconnexion */}
        {isDisconnected && (
          <div className="bg-red-600/90 text-white p-4 rounded-lg text-center">
            <p className="text-xl mb-4">Vous avez été déconnecté</p>
            <button
              onClick={() => navigate('/')}
              className="bg-white text-red-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        )}

        {/* État des joueurs */}
        {!isDisconnected && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((num) => (
              <div 
                key={num}
                className={`p-4 rounded-lg text-center transition-colors duration-200 ${
                  connectedPlayers.includes(`player${num}`)
                    ? 'bg-green-600/90'
                    : 'bg-gray-700/90'
                }`}
              >
                <div className="font-bold text-lg">Joueur {num}</div>
                <div className="text-sm">
                  {connectedPlayers.includes(`player${num}`)
                    ? '✅ Connecté'
                    : '⏳ En attente'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Compteur de démarrage */}
        {countdown !== null && !isDisconnected && (
          <div className="text-center">
            <div className="text-6xl font-bold mb-4">{countdown}</div>
            <p className="text-xl text-gray-300">
              La partie commence dans {countdown} seconde{countdown > 1 ? 's' : ''}...
            </p>
          </div>
        )}

        {/* Message d'attente */}
        {!isDisconnected && connectedPlayers.length < 4 && (
          <div className="text-center text-gray-400">
            En attente de {4 - connectedPlayers.length} joueur{4 - connectedPlayers.length > 1 ? 's' : ''}...
          </div>
        )}
      </div>
    </div>
  );
}

export default WaitingRoom; 