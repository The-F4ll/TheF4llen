import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';

function PlayerBase() {
  const { playerNumber } = useParams();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(900000); // 15 minutes en millisecondes
  const [gameData, setGameData] = useState(null);
  const [code, setCode] = useState('');
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedPlayers, setConnectedPlayers] = useState([]);
  const [submittedPlayers, setSubmittedPlayers] = useState(new Set());
  const [errorCounts, setErrorCounts] = useState({});
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

  // Timer pour la disparition automatique du message
  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ type: '', message: '' });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [feedback.message]);

  useEffect(() => {
    // Charger les données du jeu
    fetch('/games.json')
      .then(response => response.json())
      .then(data => setGameData(data))
      .catch(error => {
        console.error('Erreur lors du chargement des données:', error);
        setFeedback({
          type: 'error',
          message: 'Erreur lors du chargement des données du jeu'
        });
      });

    // Connexion WebSocket
    socketRef.current = io('http://10.6.2.29:3001', {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });
    
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      socketRef.current.emit('JOIN_ROOM', {
        roomId: 'game1',
        playerId: `player${playerNumber}`
      });
    });

    socketRef.current.on('GAME_STATE', (data) => {
      setCurrentLevel(data.level);
      setTimeLeft(data.timeLeft);
    });

    socketRef.current.on('LEVEL_START', (data) => {
      setCurrentLevel(data.level);
      setTimeLeft(data.timeLeft);
      setFeedback({ type: '', message: '' });
      setAnswer('');
      setSubmittedPlayers(new Set());
      setErrorCounts({});
    });

    socketRef.current.on('TIME_UPDATE', (data) => {
      setTimeLeft(data.timeLeft);
    });

    socketRef.current.on('LEVEL_COMPLETED', (data) => {
      setFeedback({
        type: 'success',
        message: data.message
      });
    });

    socketRef.current.on('LEVEL_FAILED', (data) => {
      setFeedback({
        type: 'error',
        message: data.message
      });
    });

    socketRef.current.on('GAME_WON', (data) => {
      setFeedback({
        type: 'success',
        message: data.message
      });
      setIsGameOver(true);
    });

    socketRef.current.on('PLAYERS_STATUS', (data) => {
      setConnectedPlayers(data.connectedPlayers);
      setSubmittedPlayers(new Set(data.submittedPlayers));
      setErrorCounts(data.errorCounts);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [playerNumber]);

  useEffect(() => {
    if (gameData) {
      const currentLevelData = gameData.levels.find(level => level.level === currentLevel);
      if (currentLevelData && currentLevelData.players[playerNumber]) {
        setCode(currentLevelData.players[playerNumber].code);
      }
    }
  }, [currentLevel, gameData, playerNumber]);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (!isConnected || !answer.trim()) return;

    socketRef.current.emit('SUBMIT_CODE', {
      roomId: 'game1',
      playerId: `player${playerNumber}`,
      code: answer
    });
  };

  if (!gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const currentLevelData = gameData.levels.find(level => level.level === currentLevel);
  if (!currentLevelData) {
    return (
      <div className={`min-h-screen bg-${getColor(playerNumber)}-900 text-white p-4 flex items-center justify-center`}>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Erreur</h1>
          <p className="text-xl mb-8">Niveau non trouvé</p>
          <Link to="/" className="btn btn-primary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <div className={`min-h-screen bg-${getColor(playerNumber)}-900 text-white p-4 flex items-center justify-center`}>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            {timeLeft === 0 ? '⏰ Temps écoulé !' : '🎉 Félicitations !'}
          </h1>
          <p className="text-xl mb-8">
            {timeLeft === 0 
              ? 'Le temps est écoulé. Vous pouvez recommencer en rafraîchissant la page.'
              : 'Vous avez atteint le sommet du Mont Seraph !'}
          </p>
          <Link to="/" className="btn btn-primary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-${getColor(playerNumber)}-900 text-white p-4`}>
      <div className="max-w-6xl mx-auto">
        {/* Barre d'état flottante */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-4 py-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-white hover:text-gray-300">
                  ← Retour à l'accueil
                </Link>
                <div className="text-xl font-bold">
                  ⏱️ {formatTime(timeLeft)}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span>Niveau {currentLevel} sur 5</span>
                <span>{Math.round((currentLevel / 5) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* État des joueurs connectés */}
        <div className="fixed top-14 left-0 right-0 z-40 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700">
          <div className="max-w-6xl mx-auto px-4 py-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              {[1, 2, 3, 4].map((num) => (
                <div 
                  key={num}
                  className={`p-2 rounded text-sm sm:text-base transition-colors duration-200 ${
                    connectedPlayers.includes(`player${num}`)
                      ? submittedPlayers.has(`player${num}`)
                        ? 'bg-green-600/90 hover:bg-green-600'
                        : 'bg-blue-600/90 hover:bg-blue-600'
                      : 'bg-gray-700/90 hover:bg-gray-700'
                  }`}
                >
                  <div className="font-bold">Joueur {num}</div>
                  <div className="text-xs sm:text-sm">
                    {connectedPlayers.includes(`player${num}`)
                      ? submittedPlayers.has(`player${num}`)
                        ? '✅ Réponse validée'
                        : '🔄 En attente'
                      : '❌ Non connecté'}
                  </div>
                  {connectedPlayers.includes(`player${num}`) && (
                    <div className="text-xs mt-1">
                      ❌ Erreurs : {errorCounts[`player${num}`] || 0}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contenu principal avec padding pour les barres fixes */}
        <div className="pt-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Partie gauche : Histoire et objectifs */}
            <div className="space-y-6">
              <div className="card">
                <h1 className="text-3xl font-bold mb-4">
                  {getRole(playerNumber)} - Niveau {currentLevel}
                </h1>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">📜 Histoire</h2>
                    <p className="text-gray-300">{currentLevelData.description.lore}</p>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-2">🎯 Objectif</h2>
                    <p className="text-gray-300">{currentLevelData.description.objectif}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">💡 Indice</h2>
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    {showHint ? 'Masquer' : 'Voir'}
                  </button>
                </div>
                {showHint && (
                  <p className="text-gray-300">
                    {currentLevelData.players[playerNumber].hint}
                  </p>
                )}
              </div>
            </div>

            {/* Partie droite : Code et réponse */}
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Votre Code</h2>
                <div className="h-[300px] mb-4">
                  <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={code}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyond: false,
                    }}
                  />
                </div>
              </div>

              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Votre Réponse</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Entrez votre réponse ici..."
                    className={`w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-primary ${
                      submittedPlayers.has(`player${playerNumber}`) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={submittedPlayers.has(`player${playerNumber}`)}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmit}
                      className={`btn btn-primary ${
                        submittedPlayers.has(`player${playerNumber}`) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={!isConnected || !answer.trim() || submittedPlayers.has(`player${playerNumber}`)}
                    >
                      {submittedPlayers.has(`player${playerNumber}`) 
                        ? '✅ Réponse validée' 
                        : isConnected 
                          ? 'Soumettre la réponse' 
                          : 'Connexion...'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages de feedback flottants */}
        {feedback.message && (
          <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4`}>
            <div className={`p-4 rounded-lg shadow-lg ${
              feedback.type === 'success' 
                ? 'bg-green-600/95 text-white' 
                : 'bg-red-600/95 text-white'
            } backdrop-blur-sm border ${
              feedback.type === 'success' 
                ? 'border-green-500' 
                : 'border-red-500'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {feedback.type === 'success' ? '✅' : '❌'}
                  <span>{feedback.message}</span>
                </div>
                <button 
                  onClick={() => setFeedback({ type: '', message: '' })}
                  className="text-white/80 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerBase; 