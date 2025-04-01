import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';

function PlayerBase({ playerNumber, role, color }) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(180000); // 3 minutes en millisecondes
  const [gameData, setGameData] = useState(null);
  const [code, setCode] = useState('');
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Charger les données du jeu
    fetch('/games.json')
      .then(response => response.json())
      .then(data => setGameData(data))
      .catch(error => console.error('Erreur lors du chargement des données:', error));

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
      setAnswer(''); // Réinitialiser la réponse pour le nouveau niveau
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

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [playerNumber]);

  useEffect(() => {
    if (gameData) {
      const currentLevelData = gameData.levels.find(level => level.level === currentLevel);
      if (currentLevelData) {
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

  if (isGameOver) {
    return (
      <div className={`min-h-screen bg-${color}-900 text-white p-4 flex items-center justify-center`}>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            {timeLeft === 0 ? '⏰ Temps écoulé !' : '🎉 Félicitations !'}
          </h1>
          <p className="text-xl mb-8">
            {timeLeft === 0 
              ? 'Le temps est écoulé. Vous pouvez recommencer en rafraîchissant la page.'
              : 'Vous avez atteint le sommet du Mont Seraph !'}
          </p>
          <Link 
            to="/" 
            className="btn btn-primary"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-${color}-900 text-white p-4`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="text-white hover:text-gray-300">
            ← Retour à l'accueil
          </Link>
          <div className="text-xl font-bold">
            ⏱️ {formatTime(timeLeft)}
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span>Niveau {currentLevel} sur 5</span>
            <span>{Math.round((currentLevel / 5) * 100)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill"
              style={{ width: `${(currentLevel / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Partie gauche : Histoire et objectifs */}
          <div className="space-y-6">
            <div className="card">
              <h1 className="text-3xl font-bold mb-4">
                {role} - Niveau {currentLevel}
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
                  className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmit}
                    className="btn btn-primary"
                    disabled={!isConnected || !answer.trim()}
                  >
                    {isConnected ? 'Soumettre la réponse' : 'Connexion...'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages de feedback */}
        {feedback.message && (
          <div className={`message message-${feedback.type} mt-4`}>
            {feedback.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerBase; 